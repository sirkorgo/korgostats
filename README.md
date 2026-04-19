# 📊 Korgostats
A quick self-hosted analytics tool powered by Node.js, Express, and SQLite

[API Reference](#api-reference) • [Self-hosted Setup](#self-hosting-korgostats) • [Dashboard](https://stats.sirkorgo.com)

## Setup Korgostats on Your Site
For those who don't want to self host the server needed for Korgostats, you can use my instance on korgoserver.

**To add tracking**, paste this snippet in your HTML file just before </body>
```html
<script>
    const site = location.hostname.replace(/^www\./, '');

    fetch('https://stats.sirkorgo.com/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site,
        page: location.pathname,
        referrer: document.referrer
      })
    });
  </script>
```
**That's it!** Your site now has simple analytics. To see the stats, visit my instance's [dashboard](https://stats.sirkorgo.com) and enter your site's domain in the search box.

**To display a visitor counter on your site**:
First, add this script in your HTML just before </body>:
```html
<script>
    const site = location.hostname.replace(/^www\./, '');
    fetch('https://stats.sirkorgo.com/count?site=' + site)
      .then(r => r.json())
      .then(d => document.getElementById('visitors').innerHTML = d.count);
</script>
```

Then, add the attribute `id="visitors"` to the element that you want to display the view counter.
Example:
```html
<p id="visitors"></p>
```
## Self-hosting Korgostats
**Dependencies**
To self-host Korgostats, all you need is:
- A Server or VPS
- Docker Compose

TLDR:
```bash
git clone https://github.com/sirkorgo/korgostats.git
cd korgostats
docker compose up -d
```
**That's it!** The dashboard and API will be hosted at [your.server.address]://3100 by default.

Detailed Instructions:
First, clone the repo
```bash
git clone https://github.com/sirkorgo/korgostats.git
```
Then, open the repo directory
```bash
cd korgostats
```
<sub>this may be different depending on your setup</sub>
If you would like to customize the directories or the ports, edit `docker-compose.yml`. If not, just run the following while in the repo folder:
```bash
docker compose up -d
```
**That's it!** Korgostats should now be running. By default it runs at [your.server.address]:3100

## Adding Korgostats to your site using a self-hosted instance
Refer to the **Adding Korgostats to Your Site** section, but replace all instances of `https://stats.sirkorgo.com` with your instance's URL in the code snippets.

## API Reference

| API Endpoint  | Usage |
| ------------- | ------------- |
| `POST /track`  |  Logs a visit on a site; called on every page load. | 
| `GET /count?site=sitename`  | Gets the number of unique visitors on a specified site. |
| `GET /dashboard`  | Gets all logged analytics globally in an instance's database. |
