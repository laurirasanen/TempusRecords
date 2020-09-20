# Tempus Records

The Node.js app behind [Tempus Records](https://www.youtube.com/tempusrecords/) YouTube channel.  
Renders Team Fortress 2 world record rocketjump and stickyjump runs from [Tempus Jump Network](https://tempus.xyz/) and uploads them to YouTube.

# Requirements
* [FFmpeg](https://ffmpeg.org)
* [Node.js](https://nodejs.org)
* [Source Video Render](https://github.com/crashfort/SourceDemoRender)
* [Team Fortress 2](https://www.teamfortress.com/)

# Acknowledgements
This project is made much simpler and the output quality increased thanks to several open source projects in the Source engine community.  
* [Source Video Renderer](https://github.com/crashfort/SourceDemoRender) by [crashfort](https://github.com/crashfort)
  * A high quality, performant video renderer for Source engine games.

* [tempus-api-graphql](https://github.com/arispoloway/tempus-api-graphql) by [Aris Poloway](https://github.com/arispoloway)
  * A GraphQL wrapper for the tempus.xyz API.

* [Tempus Hub](https://github.com/TheRealHona/TempusHub/) by [Luke Parker](https://github.com/TheRealHona)
  * A complimentary website and API to the official Tempus one, adds features such as recent world record time splits.

Special thanks to [William Seligmann](https://github.com/jsza) for creating the Tempus Jump Network, and everyone who gets world records runs on it.