const { widget } = figma
widget.register(function ErrorWidget() {
  throw new Error("This widget template uses TypeScript. Follow the instructions in README.md to build this file.")
})
