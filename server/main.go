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
	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		routes.RegisterMapRoutes(app, e)
		routes.RegisterHealthRoutes(app, e)

		collection.CreateTableCluster(app)
		collection.CreateTableMarker(app)
		collection.CreateSampleMarker(app)

		return e.Next()
	})

	err := app.Start(); if err != nil {
		log.Fatal(err)
	}
}