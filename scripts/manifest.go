package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
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
		return nil, fmt.Errorf("os.Stat(); os.IsNotExist()")
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
	s = strings.ReplaceAll(s, "'", "\\'")
	s = strings.ReplaceAll(s, "\n", "\\n")
	s = strings.ReplaceAll(s, "\r", "\\r")
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

func (mg *ManifestGenerator) write(pkg *Package) string {
	var lines []string

	config := mg.config.Defaults
	if pkg.Manifest != nil {
		if pkg.Manifest.FxVersion != "" {
			config.FxVersion = pkg.Manifest.FxVersion
		}
		if pkg.Manifest.Game != "" {
			config.Game = pkg.Manifest.Game
		}
		if pkg.Manifest.NodeVersion != "" {
			config.NodeVersion = pkg.Manifest.NodeVersion
		}
		if len(pkg.Manifest.Client) > 0 {
			config.Client = pkg.Manifest.Client
		}
		if len(pkg.Manifest.Server) > 0 {
			config.Server = pkg.Manifest.Server
		}
		if len(pkg.Manifest.Files) > 0 {
			config.Files = pkg.Manifest.Files
		}
		if len(pkg.Manifest.Dependencies) > 0 {
			config.Dependencies = pkg.Manifest.Dependencies
		}
	}

	lines = append(lines, fmt.Sprintf("fx_version '%s'", config.FxVersion))
	lines = append(lines, fmt.Sprintf("game '%s'", config.Game))

	if pkg.Name != "" {
		lines = append(lines, fmt.Sprintf("name '%s'", sanitize(pkg.Name)))
	}
	if pkg.Description != "" {
		lines = append(lines, fmt.Sprintf("description '%s'", sanitize(pkg.Description)))
	}
	if pkg.Author != "" {
		lines = append(lines, fmt.Sprintf("author '%s'", sanitize(pkg.Author)))
	}
	if pkg.Version != "" {
		lines = append(lines, fmt.Sprintf("version '%s'", sanitize(pkg.Version)))
	}
	if pkg.Repository.URL != "" {
		lines = append(lines, fmt.Sprintf("repository '%s'", sanitize(pkg.Repository.URL)))
	}
	if pkg.License != "" {
		lines = append(lines, fmt.Sprintf("license '%s'", sanitize(pkg.License)))
	}

	if config.NodeVersion != "" {
		lines = append(lines, fmt.Sprintf("node_version '%s'", config.NodeVersion))
	}

	add(&lines, "client_scripts", config.Client)
	add(&lines, "server_scripts", config.Server)
	add(&lines, "files", config.Files)
	add(&lines, "dependencies", config.Dependencies)

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

	fmt.Printf("Successfully generated %s", config.Output)
}
