package collection

import (
	"encoding/json"
	"main/config"
	"os"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
)

var COLL_NAME string = "marker"
var mode string = config.GetAppMode()

func CreateTableMarker(app *pocketbase.PocketBase) error {
	coll, _ := app.FindCollectionByNameOrId(COLL_NAME); if mode == "dev" {
		if coll != nil {
			app.Delete(coll)
		}
	}

	if coll != nil {
		return nil
	}

	coll = core.NewBaseCollection(COLL_NAME);
	coll.ViewRule = types.Pointer("@request.auth.id != ''");
	coll.ListRule = types.Pointer("@request.auth.id != ''");
	coll.CreateRule = types.Pointer("@request.auth.id != ''");
	coll.UpdateRule = types.Pointer("@request.auth.id != ''");
	coll.DeleteRule = types.Pointer("@request.auth.id != ''");

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

		&core.AutodateField{
			Name      : "created",
			OnCreate  : true,
		},

		&core.AutodateField{
			Name      : "updated",
			OnCreate  : true,
			OnUpdate  : true,
		},
	)

	return app.Save(coll);
}

func CreateSample(app *pocketbase.PocketBase) error {
	if mode == "dev" { return nil }

	datas, err := os.ReadFile("./data/cameras.json"); if err != nil {
		return err
	}
	items := []map[string]string{}
	err = json.Unmarshal(datas, &items); if err != nil {
		return err
	}

	coll, err := app.FindCachedCollectionByNameOrId("marker"); if err != nil {
		return err
	}

	err = app.TruncateCollection(coll); if err != nil {
		return err
	}

	for _, camera := range items {
		record := core.NewRecord(coll)
		record.Set("label", camera["label"])
		record.Set("longitude", camera["longitude"])
		record.Set("latitude", camera["latitude"])
		record.Set("type", camera["type"])
		record.Set("", "")
	}
	return nil
}