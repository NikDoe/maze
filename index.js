const { Engine, Render, Runner, World, Bodies } = Matter;

const cells = 3;
const width = 600;
const height = 600;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
	element: document.body,
	engine,
	options: {
		width,
		height,
	},
});

Render.run(render);
Runner.run(Runner.create(), engine);

const walls = [
	Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 40, height, { isStatic: true }),
];

World.add(world, walls);

//maze generation
const grid = Array(cells)
	.fill(null)
	.map(() => Array(cells).fill(false));

const verticalsWalls = Array(cells)
	.fill(null)
	.map(() => Array(cells - 1).fill(false));

const horizontalsWalls = Array(cells - 1)
	.fill(null)
	.map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

console.log(startRow, startColumn);

const stepThroughCell = (row, column) => {
	// If i have visited the cell at [row, column], then return
	// Mark this cell as being visited
	// Assemble randomly-ordered list of neighbors
	// For each neighbor....
	// See if that neighbor is out of bounds
	// If we have visited that neighbor, continue to next neighbor
	// Remove a wall from either horizontals or verticals
	// Visit that next cell
};

stepThroughCell(startRow, startColumn);
