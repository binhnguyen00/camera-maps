package config

import "os"

func GetAppMode() string {
	for _, arg := range os.Args {
		if arg == "--dev" {
			return "dev"
		}
	}
	return "prod"
}
