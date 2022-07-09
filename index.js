const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cells = 10;
const width = window.innerWidth;
const height = window.innerHeight;
const unitLength = width / cells;

const engine = Engine.create();

//set the gravity off
engine.world.gravity.y = 0;

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
	Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
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

horizontalsWalls.forEach((row, rowIndex) =>
	row.forEach((open, columnIndex) => {
		if (open) return;
		const wall = Bodies.rectangle(
			columnIndex * unitLength + unitLength / 2,
			rowIndex * unitLength + unitLength,
			unitLength,
			5,
			{ label: 'wall', isStatic: true },
		);
		World.add(world, wall);
	}),
);

verticalsWalls.forEach((column, rowIndex) => {
	column.forEach((open, columnIndex) => {
		if (open) return;

		const wall = Bodies.rectangle(
			columnIndex * unitLength + unitLength,
			rowIndex * unitLength + unitLength / 2,
			5,
			unitLength,
			{ label: 'wall', isStatic: true },
		);
		World.add(world, wall);
	});
});

const goal = Bodies.rectangle(
	width - unitLength / 2,
	height - unitLength / 2,
	unitLength * 0.6,
	unitLength * 0.6,
	{
		label: 'goal',
		isStatic: true,
	},
);

World.add(world, goal);

const ball = Bodies.circle(unitLength / 2, unitLength / 2, unitLength / 4, {
	label: 'ball',
});

World.add(world, ball);

document.addEventListener('keydown', event => {
	const { x, y } = ball.velocity;

	if (event.code === 'KeyW') Body.setVelocity(ball, { x, y: y - 4 });
	if (event.code === 'KeyD') Body.setVelocity(ball, { x: x + 4, y });
	if (event.code === 'KeyS') Body.setVelocity(ball, { x, y: y + 4 });
	if (event.code === 'KeyA') Body.setVelocity(ball, { x: x - 4, y });
});

//win condition
Events.on(engine, 'collisionStart', event => {
	event.pairs.forEach(collision => {
		const labels = ['ball', 'goal'];

		if (
			labels.includes(collision.bodyA.label) &&
			labels.includes(collision.bodyB.label)
		) {
			world.gravity.y = 1;
			world.bodies.forEach(body => {
				if (body.label === 'wall') Body.setStatic(body, false);
			});
		}
	});
});
