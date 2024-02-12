module.exports = {
  packagerConfig: {
    // dir: "./app",
    //ignore: [".idea", ".gitignore", "^/src", "^/demo", "^/dist"],
    ignore: [".idea", ".gitignore", "^/.env$", "^/demo", "^/dist"],
    icon: "./build/icon",
    win32: {
      icon: "./build/icon.ico",
      target: "nsis",
      config: {
        productName: "Panda",
        exe: "Panda.exe",
        description: "A font processing App, Support for macOS and Windows.",
        authors: "arayofsunshine.dev",
        noMsi: true,
        setupExe: "Panda-Setup.exe",
        setupIcon: "./build/icon.ico"
      }
    }
  },
  rebuildConfig: {},

  makers: [
    {
      name: '@electron-forge/maker-squirrel'
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "leibnizli",
          name: "panda"
        },
        draft: true
      }
    }
  ],
  plugins: [],
};
