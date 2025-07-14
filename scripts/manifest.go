package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"reflect"
	"strings"
)

type Package struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Author      string `json:"author"`
	Version     string `json:"version"`
	Repository  struct {
		URL string `json:"url"`
	} `json:"repository"`
	License  string    `json:"license"`
	Manifest *Defaults `json:"manifest,omitempty"`
}

type Defaults struct {
	FxVersion    string   `json:"fx_version,omitempty"`
	Game         string   `json:"game,omitempty"`
	NodeVersion  string   `json:"node_version,omitempty"`
	Client       []string `json:"client_scripts,omitempty"`
	Server       []string `json:"server_scripts,omitempty"`
	Files        []string `json:"files,omitempty"`
	Dependencies []string `json:"dependencies,omitempty"`
}

type Config struct {
	Package  string
	Output   string
	Defaults Defaults
}

func Init() *Config {
	return &Config{
		Package: "package.json",
		Output:  "fxmanifest.lua",
		Defaults: Defaults{
			FxVersion:    "cerulean",
			Game:         "gta5",
			NodeVersion:  "22",
			Client:       []string{"dist/client/*.js"},
			Server:       []string{"dist/server/*.js"},
			Files:        []string{"locales/*.json"},
			Dependencies: []string{"/server:12913", "/onesync", "ox_lib", "ox_core", "ox_inventory"},
		},
	}
}

type ManifestGenerator struct {
	config *Config
}

func new(config *Config) *ManifestGenerator {
	return &ManifestGenerator{config: config}
}

func (mg *ManifestGenerator) load() (*Package, error) {
	if _, err := os.Stat(mg.config.Package); os.IsNotExist(err) {
		return nil, fmt.Errorf("os.Stat(); os.IsNotExist(): %w", err)
	}

	data, err := os.ReadFile(mg.config.Package)
	if err != nil {
		return nil, fmt.Errorf("os.ReadFile() %s: %w", mg.config.Package, err)
	}

	var pkg Package
	if err := json.Unmarshal(data, &pkg); err != nil {
		return nil, fmt.Errorf("json.Unmarshal() %s: %w", mg.config.Package, err)
	}

	return &pkg, nil
}

func sanitize(s string) string {
	replace := map[string]string{
		"'":  "\\'",
		"\n": "\\n",
		"\r": "\\r",
	}

	for old, new := range replace {
		s = strings.ReplaceAll(s, old, new)
	}
	return s
}

func add(lines *[]string, title string, items []string) {
	if len(items) == 0 {
		return
	}

	*lines = append(*lines, fmt.Sprintf("\n%s {", title))
	for i, item := range items {
		comma := ","
		if i == len(items)-1 {
			comma = ""
		}
		*lines = append(*lines, fmt.Sprintf("\t'%s'%s", sanitize(item), comma))
	}
	*lines = append(*lines, "}")
}

func merge(defaults Defaults, manifest *Defaults) Defaults {
	if manifest == nil {
		return defaults
	}

	result := defaults
	value := reflect.ValueOf(&result).Elem()
	data := reflect.ValueOf(manifest).Elem()

	for i := 0; i < data.NumField(); i++ {
		field := data.Field(i)
		if !field.IsZero() {
			value.Field(i).Set(field)
		}
	}

	return result
}

func optional(lines *[]string, field, value string) {
	if value != "" {
		*lines = append(*lines, fmt.Sprintf("%s '%s'", field, sanitize(value)))
	}
}

func (mg *ManifestGenerator) write(pkg *Package) string {
	var lines []string

	config := merge(mg.config.Defaults, pkg.Manifest)

	lines = append(lines, fmt.Sprintf("fx_version '%s'", config.FxVersion))
	lines = append(lines, fmt.Sprintf("game '%s'", config.Game))

	opt := []struct {
		field string
		value string
	}{
		{"name", pkg.Name},
		{"description", pkg.Description},
		{"author", pkg.Author},
		{"version", pkg.Version},
		{"repository", pkg.Repository.URL},
		{"license", pkg.License},
		{"node_version", config.NodeVersion},
	}

	for _, pf := range opt {
		optional(&lines, pf.field, pf.value)
	}

	req := []struct {
		title string
		items []string
	}{
		{"client_scripts", config.Client},
		{"server_scripts", config.Server},
		{"files", config.Files},
		{"dependencies", config.Dependencies},
	}

	for _, section := range req {
		add(&lines, section.title, section.items)
	}

	return strings.Join(lines, "\n")
}

func (mg *ManifestGenerator) Generate() error {
	pkg, err := mg.load()
	if err != nil {
		return err
	}

	manifest := mg.write(pkg)

	if err := os.WriteFile(mg.config.Output, []byte(manifest), 0644); err != nil {
		return fmt.Errorf("os.WriteFile() %s: %w", mg.config.Output, err)
	}

	return nil
}

func main() {
	config := Init()
	generator := new(config)

	if err := generator.Generate(); err != nil {
		log.Fatalf("generator.Generate(): %v", err)
	}

	fmt.Printf("Successfully generated %s\n", config.Output)
}
