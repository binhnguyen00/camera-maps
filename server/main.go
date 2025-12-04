package main

import (
	"log"
	"main/routes"
	"main/collection"
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

		collection.CreateTableMarker(app)

		return e.Next()
	})

	err := app.Start(); if err != nil {
		log.Fatal(err)
	}
}