var count = 0;
    var container = document.getElementById('container');
    var animData = {
        container: container,
        renderer: 'svg',
        loop: false,
        prerender: true,
        autoplay: true,
        autoloadSegments: false,
        path: 'https://api.myjson.com/bins/befr9.json'
    };

    var anim;

    anim = bodymovin.loadAnimation(animData);