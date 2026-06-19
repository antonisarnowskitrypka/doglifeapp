#!/usr/bin/env node
// Dev launcher: make sure the Firebase Emulator Suite is up, then run `nuxt dev`.
//
// - If the emulators are already running we reuse them and leave them alone
//   (we never tear down something we didn't start).
// - If they're not, we start them, wait until they're ready, then start Nuxt.
//   When this process exits, only the emulators we started are stopped.
//
// Emulator data is ephemeral by design (LOCAL data is disposable).

import { spawn } from 'node:child_process'
import net from 'node:net'

// Firestore emulator port from firebase.json — used as the "is it up?" probe.
const PROBE_HOST = '127.0.0.1'
const PROBE_PORT = 8080
const STARTUP_TIMEOUT_MS = 60_000
const POLL_INTERVAL_MS = 500

const isWin = process.platform === 'win32'

/** Resolve true if a TCP connection to host:port succeeds within 1s. */
function probe(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port })
    socket.setTimeout(1000)
    const done = (result) => {
      socket.destroy()
      resolve(result)
    }
    socket.once('connect', () => done(true))
    socket.once('timeout', () => done(false))
    socket.once('error', () => resolve(false))
  })
}

async function waitForEmulators() {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (await probe(PROBE_HOST, PROBE_PORT)) return true
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
  }
  return false
}

const children = []
let shuttingDown = false

function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    if (!child.killed) child.kill('SIGINT')
  }
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

function spawnProcess(command, args, onExit) {
  const child = spawn(command, args, { stdio: 'inherit', shell: isWin })
  child.on('error', (err) => {
    if (err.code === 'ENOENT') {
      console.error(`✗ "${command}" not found on PATH.`)
      if (command === 'firebase') {
        console.error('  Install the Firebase CLI: npm i -g firebase-tools')
      }
    } else {
      console.error(`✗ Failed to start "${command}": ${err.message}`)
    }
    shutdown(1)
  })
  child.on('exit', onExit)
  return child
}

if (await probe(PROBE_HOST, PROBE_PORT)) {
  console.log('✓ Firebase emulators already running — reusing them.')
} else {
  console.log('▶ Starting Firebase emulators…')
  children.push(
    spawnProcess('firebase', ['emulators:start'], (code) => {
      if (!shuttingDown) {
        console.error(`✗ Firebase emulators exited (code ${code ?? 'unknown'}).`)
        shutdown(code ?? 1)
      }
    })
  )

  if (!(await waitForEmulators())) {
    console.error('✗ Firebase emulators did not come up within timeout.')
    shutdown(1)
  }
  console.log('✓ Firebase emulators ready.')
}

children.push(spawnProcess('nuxt', ['dev'], code => shutdown(code ?? 0)))
