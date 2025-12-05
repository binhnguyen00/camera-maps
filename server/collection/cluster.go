package collection

import (
	"main/config"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	// "github.com/pocketbase/pocketbase/tools/types"
)

func CreateTableCluster(app *pocketbase.PocketBase) error {
	COLL_NAME := "cluster"
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

	coll.Fields.Add(
		&core.TextField{
			Name:     "title",
			Required: false,
		},

		&core.EditorField{
			Name:     "description",
			Required: false,
		},

		&core.TextField{
			Name:     "latitude",
			Required: false,
		},

		&core.TextField{
			Name:     "longitude",
			Required: false,
		},
	)

	return app.Save(coll)
}
