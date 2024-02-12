module.exports = {
  packagerConfig: {
    // dir: "./app",
    //ignore: [".idea", ".gitignore", "^/src", "^/demo", "^/dist"],
    ignore: [".idea", ".gitignore", "^/.env$", "^/src", "^/demo", "^/dist"],
    icon: "./build/icon",
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
