const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 6;
const cellsVertical = 4;
const width = window.innerWidth;
const height = window.innerHeight;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();

//set the gravity off
engine.world.gravity.y = 0;

const { world } = engine;
const render = Render.create({
	element: document.body,
	engine,
	options: {
		wireframes: false,
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
const grid = Array(cellsVertical)
	.fill(null)
	.map(() => Array(cellsHorizontal).fill(false));

const verticalsWalls = Array(cellsVertical)
	.fill(null)
	.map(() => Array(cellsHorizontal - 1).fill(false));

const horizontalsWalls = Array(cellsVertical - 1)
	.fill(null)
	.map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

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
			nextRow >= cellsVertical ||
			nextColumn < 0 ||
			nextColumn >= cellsHorizontal
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
			columnIndex * unitLengthX + unitLengthX / 2,
			rowIndex * unitLengthY + unitLengthY,
			unitLengthX,
			5,
			{
				label: 'wall',
				isStatic: true,
				render: { fillStyle: 'indianred' },
			},
		);
		World.add(world, wall);
	}),
);

verticalsWalls.forEach((column, rowIndex) => {
	column.forEach((open, columnIndex) => {
		if (open) return;

		const wall = Bodies.rectangle(
			columnIndex * unitLengthX + unitLengthX,
			rowIndex * unitLengthY + unitLengthY / 2,
			5,
			unitLengthY,
			{
				label: 'wall',
				isStatic: true,
				render: { fillStyle: 'indianred' },
			},
		);
		World.add(world, wall);
	});
});

const goal = Bodies.rectangle(
	width - unitLengthX / 2,
	height - unitLengthY / 2,
	unitLengthX * 0.6,
	unitLengthY * 0.6,
	{
		label: 'goal',
		isStatic: true,
		render: { fillStyle: 'white' },
	},
);

World.add(world, goal);

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
	label: 'ball',
	render: { fillStyle: 'darkorange' },
});

World.add(world, ball);

document.addEventListener('keydown', event => {
	const { x, y } = ball.velocity;

	if (event.code === 'KeyW') Body.setVelocity(ball, { x, y: y - 3 });
	if (event.code === 'KeyD') Body.setVelocity(ball, { x: x + 3, y });
	if (event.code === 'KeyS') Body.setVelocity(ball, { x, y: y + 3 });
	if (event.code === 'KeyA') Body.setVelocity(ball, { x: x - 3, y });
});

//win condition
Events.on(engine, 'collisionStart', event => {
	event.pairs.forEach(collision => {
		const labels = ['ball', 'goal'];

		if (
			labels.includes(collision.bodyA.label) &&
			labels.includes(collision.bodyB.label)
		) {
			document.querySelector('.winner').classList.remove('hidden');
			world.gravity.y = 1;
			world.bodies.forEach(body => {
				if (body.label === 'wall') Body.setStatic(body, false);
			});
		}
	});
});
