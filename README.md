# Zoomy 'Zoom' jQuery Plugin
#### Zoomy can make life easier _on the eyes. ^_^
-------------------------------------------------------------

## Getting Started

[_WIKI pages_](https://github.com/jacoblwe20/zoomy-plugin/wiki/_pages)

## Developing

Just recently I have added a simple file server script that runs on NodeJS. To run the script just use this command in your terminal.

	node app.js

If Node is not installed this will not run.

# New Feature

###Zoomy Touch

This is a pretty large new feature and is written right into the core of Zoomy. Just add an extra file and you have Zoomy working on touch devices.

###Responsive

This has been a feature for a while in my dev files, but finally it has made it to stable. 

## Last Update

Now you can add a border to the zoom element. Also a [*Wiki*](https://github.com/jacoblwe20/zoomy-plugin/wiki/_pages) has been created and will be on the new website within the next month. 

Callbacks, callbacks, callbacks. We have inserted three new callbacks, zoomInit, zoomStart, and zoomEnd. These all stem for the fact that zoomText has been completely removed due to it UI invasiveness and buggy handling. Now to handle some text as if zoomText just use the callbacks to show hide the text. ZoomInit is called when the Zoomy function first fires so if you need to append any elemen to your anchor tag through the zoomInit callback would be the best time. The event handler is complete and pretty solid.

# Contributors

_Jacob Lowe_ [Email](mailto:jacob@redeyeops.com)

_Larry Battle_ 

_Chris Pearson_ [Website](http://www.upland.co.uk)

Suggest Features @ [http://redeyeoperations.com/plugins/zoomy](http://redeyeoperations.com/plugins/zoomy)