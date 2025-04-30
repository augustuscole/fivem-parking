package main

import (
	"encoding/json"
	"fmt"
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
	License string `json:"license"`
}

func main() {
	data, err := os.ReadFile("package.json")
	if err != nil {
		fmt.Printf("os.ReadFile(): %v\n", err)
		return
	}

	var pkg Package
	if err := json.Unmarshal(data, &pkg); err != nil {
		fmt.Printf("json.Unmarshal(): %v\n", err)
		return
	}

	cache := []string{
		"fx_version 'cerulean'",
		"game 'gta5'",
		fmt.Sprintf("name '%s'", pkg.Name),
		fmt.Sprintf("description '%s'", pkg.Description),
		fmt.Sprintf("author '%s'", pkg.Author),
		fmt.Sprintf("version '%s'", pkg.Version),
		fmt.Sprintf("repository '%s'", pkg.Repository.URL),
		fmt.Sprintf("license '%s'", pkg.License),
		"node_version '22'",
	}

	add := func(title string, items []string) {
		if len(items) == 0 {
			return
		}
		cache = append(cache, fmt.Sprintf("\n%s {", title))
		for i, item := range items {
			comma := ","
			if i == len(items)-1 {
				comma = ""
			}
			cache = append(cache, fmt.Sprintf("\t'%s'%s", item, comma))
		}
		cache = append(cache, "}")
	}

	add("client_scripts", []string{"dist/client/*.js"})
	add("server_scripts", []string{"dist/server/*.js"})
	add("files", []string{"locales/*.json"})
	add("dependencies", []string{"/server:12913", "/onesync", "ox_lib", "ox_core", "ox_inventory"})

	if err := os.WriteFile("fxmanifest.lua", []byte(strings.Join(cache, "\n")), 0644); err != nil {
		fmt.Printf("os.WriteFile(): %v\n", err)
		return
	}
}
