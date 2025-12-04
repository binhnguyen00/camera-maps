package collection;

import (
	"github.com/pocketbase/pocketbase"
)

var COLL_NAME string = "marker"

func CreateTableMarker(app *pocketbase.PocketBase, mode string) {
	coll, _ := app.FindCollectionByNameOrId(COLL_NAME)
	if coll != nil {
		app.Delete(coll)
	}
}