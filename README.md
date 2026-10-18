# Adii AI Chatbot

A mobile-friendly AI chat website with a Node.js backend. The API key stays on the server and is not exposed in the browser.

## Deploy using GitHub + Render (phone-friendly)

1. Upload the contents of this folder to the root of your GitHub repository. Keep `server.js`, `package.json`, `README.md`, `.env.example`, and the `public` folder.
2. In Render, create **New + → Web Service** and connect the GitHub repository.
3. Use these settings:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
4. In the service's **Environment** settings, add `OPENAI_API_KEY` with your own API key. Optionally add `OPENAI_MODEL` = `gpt-4o-mini`.
5. Deploy and open the Render URL.

## Important

- The website cannot give real AI answers until `OPENAI_API_KEY` is set on the server.
- Never put your real API key in `public/index.html`, GitHub files, screenshots, or messages.
- API usage may cost money and is subject to your provider account's limits.
- If you change the code, push the changes to GitHub and redeploy.
