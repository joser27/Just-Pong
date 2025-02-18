class AssetManager {
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.downloadQueue = [];
    };

    queueDownload(path) {
        console.log("Queueing " + path);
        this.downloadQueue.push(path);
    };

    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    };

    downloadAll(callback) {
        if (this.downloadQueue.length === 0) setTimeout(callback, 10);
        for (let i = 0; i < this.downloadQueue.length; i++) {
            const path = this.downloadQueue[i];
            console.log(path);

            if (path.endsWith('.ttf')) {
                // Handle TTF font files
                const fontName = path.split('/').pop().split('.')[0]; 
                const fontFace = new FontFace(fontName, `url(${path})`);
                
                fontFace.load().then((loadedFace) => {
                    document.fonts.add(loadedFace);
                    this.cache[path] = fontName; 
                    console.log("Loaded " + path);
                    this.successCount++;
                    if (this.isDone()) callback();
                }).catch((error) => {
                    console.log("Error loading " + path, error);
                    this.errorCount++;
                    if (this.isDone()) callback();
                });
            } else if (path.endsWith('.wav') || path.endsWith('.mp3')) {
                const audio = new Audio();
                audio.addEventListener("loadeddata", () => {
                    console.log("Loaded " + audio.src);
                    this.successCount++;
                    if (this.isDone()) callback();
                });

                audio.addEventListener("error", () => {
                    console.log("Error loading " + audio.src);
                    this.errorCount++;
                    if (this.isDone()) callback();
                });

                audio.src = path;
                this.cache[path] = audio;
            } else if (path.endsWith('.tmj')) {
                // Handle TMJ file
                fetch(path)
                    .then(response => response.json())
                    .then(data => {
                        this.cache[path] = data;
                        console.log("Loaded " + path);
                        this.successCount++;
                        if (this.isDone()) callback();
                    })
                    .catch(error => {
                        console.log("Error loading " + path, error);
                        this.errorCount++;
                        if (this.isDone()) callback();
                    });
            } else {
                // Handle image files (existing code)
                const img = new Image();
                img.addEventListener("load", () => {
                    console.log("Loaded " + img.src);
                    this.successCount++;
                    if (this.isDone()) callback();
                });

                img.addEventListener("error", () => {
                    console.log("Error loading " + img.src);
                    this.errorCount++;
                    if (this.isDone()) callback();
                });

                img.src = path;
                this.cache[path] = img;
            }
        }
    };

    getAsset(path) {
        return this.cache[path];
    };

    // New method to adjust audio volume
    setVolume(path, volume) {
        const asset = this.getAsset(path);
        if (asset instanceof Audio) {
            asset.volume = Math.max(0, Math.min(1, volume)); // Clamp volume between 0 and 1
        }
    };

    // New method to check if a font is loaded
    isFontLoaded(fontName) {
        return document.fonts.check(`12px ${fontName}`);
    }
};

// Initialize and attach to window
window.ASSET_MANAGER = new AssetManager();

