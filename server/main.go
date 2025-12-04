package main;

import (
  "os";
  "log";
  "github.com/pocketbase/pocketbase";
  "github.com/pocketbase/pocketbase/core";
  "main/routes";
);

func main() {
  var app *pocketbase.PocketBase = pocketbase.New();
  renderBanner(app);

  app.OnServe().BindFunc(func(e *core.ServeEvent) error {
    isDev := false;
    for _, arg := range os.Args {
      if arg == "--dev" {
        isDev = true;
      }
    }
    if isDev {
      log.Println("Mode: DEVELOPMENT");
    } else {
      log.Println("Mode: PRODUCTION");
    }

    routes.RegisterMapRoutes(app, e);
    routes.RegisterHealthRoutes(app, e);
    return e.Next();
  });

  err := app.Start(); if err != nil {
    log.Fatal(err);
  }
}

func renderBanner(app *pocketbase.PocketBase) {
  app.OnBootstrap().BindFunc(func(e *core.BootstrapEvent) error {
    log.Println(`
░███     ░███            ░██        ░██░██████████
░████   ░████            ░██           ░██
░██░██ ░██░██  ░███████  ░████████  ░██░██         ░███████  ░████████   ░███████
░██ ░████ ░██ ░██    ░██ ░██    ░██ ░██░█████████ ░██    ░██ ░██    ░██ ░██    ░██
░██  ░██  ░██ ░██    ░██ ░██    ░██ ░██░██        ░██    ░██ ░██    ░██ ░█████████
░██       ░██ ░██    ░██ ░███   ░██ ░██░██        ░██    ░██ ░██    ░██ ░██
░██       ░██  ░███████  ░██░█████  ░██░██         ░███████  ░██    ░██  ░███████
    `);
    return e.Next();
  });
}