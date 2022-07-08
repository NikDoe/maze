const { Engine, Render, Runner, World, Bodies } = Matter;

const cells = 5;
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

//shuffle neighbors
const shuffle = arr => {
	let counter = arr.length;

	while (counter > 0) {
		const index = Math.floor(Math.random() * counter);

		counter--;

		const temp = arr[counter];
		arr[counter] = arr[index];
		arr[index] = temp;
	}
	return arr;
};

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

const stepThroughCell = (row, column) => {
	// If i have visited the cell at [row, column], then return
	if (grid[row][column]) return;

	// Mark this cell as being visited
	grid[row][column] = true;

	// Assemble randomly-ordered list of neighbors
	const neighbors = shuffle([
		[row - 1, column, 'up'],
		[row, column + 1, 'right'],
		[row + 1, column, 'down'],
		[row, column - 1, 'left'],
	]);

	// For each neighbor....
	for (const neighbor of neighbors) {
		const [nextRow, nextColumn, direction] = neighbor;

		// See if that neighbor is out of bounds
		if (
			nextRow < 0 ||
			nextRow >= cells ||
			nextColumn < 0 ||
			nextColumn >= cells
		)
			continue;

		// If we have visited that neighbor, continue to next neighbor
		if (grid[nextRow][nextColumn]) continue;

		// Remove a wall from either horizontals or verticals
		if (direction === 'left') {
			verticalsWalls[row][column - 1] = true;
		} else if (direction === 'right') {
			verticalsWalls[row][column] = true;
		} else if (direction === 'up') {
			horizontalsWalls[row - 1][column] = true;
		} else {
			horizontalsWalls[row][column] = true;
		}

		// Visit that next cell
		stepThroughCell(nextRow, nextColumn);
	}
};

stepThroughCell(startRow, startColumn);
