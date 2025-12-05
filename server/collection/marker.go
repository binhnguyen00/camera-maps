package collection

import (
	"encoding/json"
	"main/config"
	"os"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
)

func CreateTableMarker(app *pocketbase.PocketBase) error {
	COLL_NAME := "marker"
	mode := config.GetAppMode()

	coll, _ := app.FindCollectionByNameOrId(COLL_NAME)
	if mode == "dev" {
		if coll != nil {
			app.Delete(coll)
			coll = nil
		}
	}

	if coll != nil {
		return nil
	}

	coll = core.NewBaseCollection(COLL_NAME)
	coll.ViewRule = types.Pointer("@request.auth.id = ''")
	coll.ListRule = types.Pointer("@request.auth.id = ''")
	coll.CreateRule = types.Pointer("@request.auth.id = ''")
	coll.UpdateRule = types.Pointer("@request.auth.id = ''")
	coll.DeleteRule = types.Pointer("@request.auth.id = ''")

	clusterColl, err := app.FindCollectionByNameOrId("cluster")
	if err != nil {
		return err
	}

	coll.Fields.Add(
		&core.TextField{
			Name			: "title",
			Required	: false,
		},

		&core.EditorField{
			Name			: "description",
			Required	: false,
		},

		&core.TextField{
			Name			: "latitude",
			Required	: false,
		},

		&core.TextField{
			Name			: "longitude",
			Required	: false,
		},

		&core.SelectField{
			Name			: "type",
			Required	: false,
			Values		: []string{"ai", "speed", "overseer", "undefined"},
		},

		&core.TextField{
			Name			: "direction",
			Required	: false,
		},

		&core.RelationField{
			Name					: "cluster_id",
			CollectionId	: clusterColl.Id,
			MaxSelect			: 1,
			Required			: false,
		},

		&core.AutodateField{
			Name			: "created",
			OnCreate	: true,
		},

		&core.AutodateField{
			Name			: "updated",
			OnCreate	: true,
			OnUpdate	: true,
		},
	)

	return app.Save(coll)
}

func CreateSampleMarker(app *pocketbase.PocketBase) error {
	mode := config.GetAppMode()
	if mode != "dev" {
		return nil
	}

	datas, err := os.ReadFile("./data/cameras.json")
	if err != nil {
		return err
	}

	items := []any{}
	err = json.Unmarshal(datas, &items)
	if err != nil {
		return err
	}

	clusterTbl, err := app.FindCachedCollectionByNameOrId("cluster")
	if err != nil {
		return err
	}
	markerTbl, err := app.FindCachedCollectionByNameOrId("marker")
	if err != nil {
		return err
	}

	err = app.TruncateCollection(markerTbl)
	if err != nil {
		return err
	}

	for _, cluster := range items {
		cls := core.NewRecord(clusterTbl)
		cls.Set("title", cluster.(map[string]any)["title"])
		cls.Set("description", cluster.(map[string]any)["description"])
		cls.Set("longitude", cluster.(map[string]any)["longitude"])
		cls.Set("latitude", cluster.(map[string]any)["latitude"])

		if err := app.Save(cls); err != nil {
			return err
		}

		cameras := cluster.(map[string]any)["cameras"]
		for _, camera := range cameras.([]any) {
			record := core.NewRecord(markerTbl)
			record.Set("title", camera.(map[string]any)["title"])
			record.Set("description", camera.(map[string]any)["description"])
			record.Set("longitude", camera.(map[string]any)["longitude"])
			record.Set("latitude", camera.(map[string]any)["latitude"])
			record.Set("type", camera.(map[string]any)["type"])
			record.Set("direction", camera.(map[string]any)["direction"])
			record.Set("cluster_id", cls.Id)

			if err := app.Save(record); err != nil {
				return err
			}
		}
	}

	return nil
}
