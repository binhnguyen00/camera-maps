package routes;

import (
  "net/http";
  "github.com/pocketbase/pocketbase";
  "github.com/pocketbase/pocketbase/core";
)

func RegisterMapRoutes(app *pocketbase.PocketBase, serveEvent *core.ServeEvent) {
  serveEvent.Router.GET("/map", func(e *core.RequestEvent) error {
    return e.String(http.StatusOK, "map");
  });
}
