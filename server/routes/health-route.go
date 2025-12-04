package routes;

import (
  "net/http";
  "github.com/pocketbase/pocketbase";
  "github.com/pocketbase/pocketbase/core";
)

func RegisterHealthRoutes(app *pocketbase.PocketBase, serveEvent *core.ServeEvent) {
  serveEvent.Router.GET("/health", func(e *core.RequestEvent) error {
    return e.String(http.StatusOK, "ok");
  });
}