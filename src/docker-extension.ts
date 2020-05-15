#!/usr/bin/env node
import { runner } from './runner';
import { removeFirstItems, removeFirstItem } from './removeItem';
import { getCallers, getDefaultCaller } from './caller';
import { evalExtensionCommand } from './extensionCommands';

const run = (): void => {

	const extensionKeyword = 'extension'

	const forwardKeywords = [
		'builder',
		'config',
		'container',
		'context',
		'image',
		'images',
		'network',
		'node',
		'plugin',
		'secret',
		'service',
		'stack',
		'swarm',
		'system',
		'trust',
		'volume',
		'rmi'
	];

	const { callers, config } = getCallers();
	const defaultCaller = getDefaultCaller(callers, config);
	const args = removeFirstItems(process.argv, 2);

	if (args.length === 0) {
		defaultCaller.invoke([]);
		return;
	}

	const command = args[0];
	// ignore docker-extension logic if the first argument is a keyword from docker
	if (forwardKeywords.some(keyword => keyword === command)) {
		const action = args[1];
		const params = removeFirstItems(args, 2);
		runner(command, action, params);
		return;
	}

	// execute docker-extension specific commands 
	if (extensionKeyword === command) {
		evalExtensionCommand(removeFirstItem(args), process.argv);
		return;
	}

	let selectCaller = callers.get(command);
	let passArgs = args;
	if (selectCaller === undefined) {
		selectCaller = defaultCaller;
	} else {
		passArgs = removeFirstItem(args);
	}
	selectCaller.invoke(passArgs);
};

run();
