package main

import (
	"log"
	"main/config"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func GetAppVersion() string {
	return "1.0.0"
}

func RenderBanner(app *pocketbase.PocketBase) {
	mode := config.GetAppMode()
	label := "PRODUCTION"
	if mode == "dev" {
		label = "DEVELOPMENT"
	}

	app.OnBootstrap().BindFunc(func(e *core.BootstrapEvent) error {
		log.Printf(`
░███     ░███            ░██        ░██░██████████
░████   ░████            ░██           ░██
░██░██ ░██░██  ░███████  ░████████  ░██░██         ░███████  ░████████   ░███████
░██ ░████ ░██ ░██    ░██ ░██    ░██ ░██░█████████ ░██    ░██ ░██    ░██ ░██    ░██
░██  ░██  ░██ ░██    ░██ ░██    ░██ ░██░██        ░██    ░██ ░██    ░██ ░█████████
░██       ░██ ░██    ░██ ░███   ░██ ░██░██        ░██    ░██ ░██    ░██ ░██
░██       ░██  ░███████  ░██░█████  ░██░██         ░███████  ░██    ░██  ░███████ %s
    `, label)
		return e.Next()
	})
}
