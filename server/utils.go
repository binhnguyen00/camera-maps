package main

import (
	"os"
	"log"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func GetAppVersion() string {
	return "1.0.0"
}

func GetAppMode() string {
	for _, arg := range os.Args {
		if arg == "--dev" {
			return "dev"
		}
	}
	return "prod"
}

func RenderBanner(app *pocketbase.PocketBase) {
	app.OnBootstrap().BindFunc(func(e *core.BootstrapEvent) error {
		log.Println(`
░███     ░███            ░██        ░██░██████████
░████   ░████            ░██           ░██
░██░██ ░██░██  ░███████  ░████████  ░██░██         ░███████  ░████████   ░███████
░██ ░████ ░██ ░██    ░██ ░██    ░██ ░██░█████████ ░██    ░██ ░██    ░██ ░██    ░██
░██  ░██  ░██ ░██    ░██ ░██    ░██ ░██░██        ░██    ░██ ░██    ░██ ░█████████
░██       ░██ ░██    ░██ ░███   ░██ ░██░██        ░██    ░██ ░██    ░██ ░██
░██       ░██  ░███████  ░██░█████  ░██░██         ░███████  ░██    ░██  ░███████
    `)
		return e.Next()
	})
}
