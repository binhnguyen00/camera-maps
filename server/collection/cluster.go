package collection

import (
	"main/config"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
)

func CreateTableCluster(app *pocketbase.PocketBase) error {
	COLL_NAME := "cluster"
	mode := config.GetAppMode()

	coll, _ := app.FindCollectionByNameOrId(COLL_NAME)
	if mode == "dev" {
		if coll != nil {
			app.TruncateCollection(coll)
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

		&core.NumberField{
			Name			: "camera_count",
			Required	: false,
		},
	)

	return app.Save(coll)
}
