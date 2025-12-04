package main

import (
	"log"
	"main/routes"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func main() {
	var app *pocketbase.PocketBase = pocketbase.New()
	RenderBanner(app)
	app.Settings().Meta = core.MetaConfig{}
	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		routes.RegisterMapRoutes(app, e)
		routes.RegisterHealthRoutes(app, e)
		return e.Next()
	})

	err := app.Start(); if err != nil {
		log.Fatal(err)
	}

	label := "PRODUCTION"; mode := GetAppMode()
	if mode == "dev" {
		label = "DEVELOPMENT"
	}
	log.Printf("Running in %s mode", label)
}