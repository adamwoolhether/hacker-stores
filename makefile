# DEPENDENCIES
# npm create vite@latest hacker-stories -- --template react
# npm install typescript @types/react @types/react-dom --save-dev
# npm install vite-plugin-svgr --save-dev
# touch tsconfig.json tsconfig.node.json

dev:
	npm install axios
	npm install typescript @types/react @types/react-dom --save-dev
	npm install vite-plugin-svgr --save-dev

run:
	npm run dev
build:
	npm run build