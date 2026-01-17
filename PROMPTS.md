# Prompts Used to Build This Project

This file tracks prompts that affected code, functionality, or documentation.

---

## 1. Initial Game Creation

> I want you to help with creating mine swipper game using TS as a language. Use thi current directoty as a starting point. I need to you create basic web application for this game. No need to have complex design, will ask you to do that later. Now need only basic functionality, but fully playable. Create all needed files, install needed packages.

## 2. Add Cloudflare Deployment Guide to README

> Add step by step guide on how to build and run this app in cloudflare into readme file

## 3. Fix Cloudflare Deployment - CSS Not Loading

> i deployed this app into cloudflare but it doesn't work - field doesn't appear. what can be wrong? If you know - just fix it and let me know what it was.

## 4. Fix Cloudflare Deployment - Empty Board

> I noticed that <div id="board"> is empty in cloudflare. What can be wrong with that?

## 5. Fix Cloudflare Deployment - MIME Type Error

> Here is what I see in devtools in chrome "Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "video/mp2t". Strict MIME type checking is enforced for module scripts per HTML spec."

## 6. Add Difficulty Level Buttons

> I want you to replace settings with 3 levels buttons: beginer 9x9 with 10 mines, Master 16x16 with 40 and Expert 30x16 with 99. Restart the dev app

## 7. Remove New Game Button & Add Flag Win Condition

> remove New game button
> make game to complete when all flags are set and they are in correct spots, no need to wait for all squares to clear

## 8. Auto-clear Board on Win

> actually autoclear all unchecked squares when player wins.

## 9. Add Unit Tests

> Create a comprehensive test suite for the Minesweeper game using Vitest. Include unit tests for: board initialization, mine placement, reveal mechanics, flag mechanics, win conditions, chord click functionality, and edge cases. Install necessary testing dependencies and add test scripts to package.json.

## 10. Green Flags on Win

> not happy about all mines turnin as blown after the win. Instead let's turn those flags green once player win