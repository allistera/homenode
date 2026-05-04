<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'


const W = 1000
const H = 680

const center = { x: W / 2, y: H / 2 }

const rooms = ref([
  { id: 1,  name: 'Manager',        floor: 'unassigned', ax: 500, ay: 60,  temp: null,  hum: null, sensors: 0, icon: '⚙️', devices: [
    { id: 'm1', icon: '📡', name: 'Hub', state: 'online' },
  ]},
  { id: 2,  name: 'Bedroom',        floor: 'top',        ax: 660, ay: 108, temp: 19.2,  hum: 84,   sensors: 1, icon: '🛏', devices: [
    { id: 'bd1', icon: '💡', name: 'Ceiling Light', state: 'off' },
    { id: 'bd2', icon: '🌡️', name: 'Thermometer', state: '19.2°C' },
    { id: 'bd3', icon: '🔌', name: 'Bedside Lamp', state: 'on' },
  ]},
  { id: 3,  name: 'Living Room',    floor: 'ground',     ax: 580, ay: 168, temp: 20.8,  hum: 52,   sensors: 1, icon: '🛋', devices: [
    { id: 'lr1', icon: '💡', name: 'Main Light', state: 'on' },
    { id: 'lr2', icon: '🌡️', name: 'Thermometer', state: '20.8°C' },
    { id: 'lr3', icon: '📺', name: 'TV', state: 'off' },
    { id: 'lr4', icon: '🌀', name: 'Fan', state: 'off' },
  ]},
  { id: 4,  name: 'Internal',       floor: 'unassigned', ax: 860, ay: 210, temp: null,  hum: null, sensors: 0, icon: '📡', devices: [
    { id: 'in1', icon: '🔌', name: 'Router', state: 'online' },
    { id: 'in2', icon: '🔌', name: 'NAS', state: 'online' },
  ]},
  { id: 5,  name: "Elsie's Room",   floor: 'ground',     ax: 800, ay: 320, temp: null,  hum: null, sensors: 0, icon: '🌸', devices: [
    { id: 'er1', icon: '💡', name: 'Ceiling Light', state: 'on' },
    { id: 'er2', icon: '🔌', name: 'Night Light', state: 'on' },
  ]},
  { id: 6,  name: 'Kitchen',        floor: 'ground',     ax: 720, ay: 440, temp: null,  hum: null, sensors: 0, icon: '🍳', devices: [
    { id: 'k1', icon: '💡', name: 'Ceiling Light', state: 'off' },
    { id: 'k2', icon: '💡', name: 'Under Cabinet', state: 'off' },
    { id: 'k3', icon: '🔌', name: 'Kettle', state: 'off' },
  ]},
  { id: 7,  name: "Jaicob's Room",  floor: 'top',        ax: 600, ay: 530, temp: null,  hum: null, sensors: 0, icon: '🎮', devices: [
    { id: 'jr1', icon: '💡', name: 'Ceiling Light', state: 'off' },
    { id: 'jr2', icon: '🔌', name: 'Desk Lamp', state: 'on' },
    { id: 'jr3', icon: '📺', name: 'Monitor', state: 'on' },
  ]},
  { id: 8,  name: 'Cupboard',       floor: 'top',        ax: 730, ay: 570, temp: null,  hum: null, sensors: 0, icon: '🚪', devices: [
    { id: 'c1', icon: '💡', name: 'Strip Light', state: 'off' },
  ]},
  { id: 9,  name: "Elsie's Bed",    floor: 'ground',     ax: 300, ay: 540, temp: null,  hum: null, sensors: 0, icon: '🌙', devices: [
    { id: 'eb1', icon: '🔌', name: 'Night Light', state: 'on' },
  ]},
  { id: 10, name: 'Toilet',         floor: 'ground',     ax: 360, ay: 430, temp: null,  hum: null, sensors: 0, icon: '🚿', devices: [
    { id: 't1', icon: '💡', name: 'Light', state: 'off' },
    { id: 't2', icon: '👁️', name: 'Motion', state: 'clear' },
  ]},
  { id: 11, name: 'Cupboard',       floor: 'ground',     ax: 200, ay: 310, temp: null,  hum: null, sensors: 0, icon: '📦', devices: [
    { id: 'cu1', icon: '💡', name: 'Strip Light', state: 'off' },
  ]},
  { id: 12, name: "Jaicob's Room",  floor: 'ground',     ax: 150, ay: 210, temp: null,  hum: null, sensors: 0, icon: '🎯', devices: [
    { id: 'jg1', icon: '💡', name: 'Ceiling Light', state: 'off' },
    { id: 'jg2', icon: '🔌', name: 'Desk Lamp', state: 'off' },
  ]},
])

const selectedRoom = ref(null)
const hoveredRoom = ref(null)
const activeFloorFilter = ref(null)

const filteredRooms = computed(() => {
  if (!activeFloorFilter.value) return rooms.value
  return rooms.value.filter(r => r.floor === activeFloorFilter.value)
})

const spreadPositions = computed(() => {
  if (!activeFloorFilter.value) return {}
  const filtered = filteredRooms.value
  const n = filtered.length
  if (n === 0) return {}
  const radius = Math.min(W, H) * 0.36
  const result = {}
  filtered.forEach((room, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2
    result[room.id] = {
      x: W / 2 + Math.cos(angle) * radius,
      y: H / 2 + Math.sin(angle) * radius,
    }
  })
  return result
})

function displayPos(room) {
  return spreadPositions.value[room.id] ?? { x: room.ax, y: room.ay }
}

function toggleFloorFilter(floor) {
  if (activeFloorFilter.value === floor) {
    activeFloorFilter.value = null
  } else {
    activeFloorFilter.value = floor
    if (selectedRoom.value && selectedRoom.value.floor !== floor) {
      goHome()
    }
  }
}

const floorColor = {
  ground: '#6ee7b7',
  top: '#c084fc',
  unassigned: '#94a3b8',
}

function roomColor(room) {
  return floorColor[room.floor]
}

function selectRoom(room) {
  selectedRoom.value = room
}

function goHome() {
  selectedRoom.value = null
}

function onKeydown(e) {
  if (e.key === 'Escape' && selectedRoom.value) goHome()
}

// Drag
const dragging = ref(null) // { room, startMouseX, startMouseY, startAx, startAy }
const dragMoved = ref(false)
const currentScale = computed(() => selectedRoom.value ? 2.2 : 1)

function onNodeMouseDown(room, e) {
  e.preventDefault()
  dragging.value = { room, startMouseX: e.clientX, startMouseY: e.clientY, startAx: room.ax, startAy: room.ay }
  dragMoved.value = false
}

function onMouseMove(e) {
  if (!dragging.value) return
  if (activeFloorFilter.value) return
  const { room, startMouseX, startMouseY, startAx, startAy } = dragging.value
  const dx = (e.clientX - startMouseX) / currentScale.value
  const dy = (e.clientY - startMouseY) / currentScale.value
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved.value = true
  room.ax = startAx + dx
  room.ay = startAy + dy
}

function onMouseUp() {
  if (!dragging.value) return
  if (dragMoved.value) {
    savePositions()
  } else {
    selectRoom(dragging.value.room)
  }
  dragging.value = null
}

const defaultPositions = Object.fromEntries(rooms.value.map(r => [r.id, { ax: r.ax, ay: r.ay }]))
const hasCustomPositions = ref(!!localStorage.getItem('nodey_positions'))

function savePositions() {
  const pos = {}
  rooms.value.forEach(r => { pos[r.id] = { ax: r.ax, ay: r.ay } })
  localStorage.setItem('nodey_positions', JSON.stringify(pos))
  hasCustomPositions.value = true
}

function loadPositions() {
  try {
    const saved = JSON.parse(localStorage.getItem('nodey_positions') || 'null')
    if (!saved) return
    rooms.value.forEach(r => { if (saved[r.id]) { r.ax = saved[r.id].ax; r.ay = saved[r.id].ay } })
  } catch {}
}

function resetPositions() {
  localStorage.removeItem('nodey_positions')
  hasCustomPositions.value = false
  rooms.value.forEach(r => { r.ax = defaultPositions[r.id].ax; r.ay = defaultPositions[r.id].ay })
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  loadPositions()
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})

const graphTransform = computed(() => {
  if (!selectedRoom.value) return 'translate(0px, 0px) scale(1)'
  const pos = displayPos(selectedRoom.value)
  const scale = 2.2
  const dx = (W / 2 - pos.x) * scale
  const dy = (H / 2 - pos.y) * scale
  return `translate(${dx}px, ${dy}px) scale(${scale})`
})

const deviceRadius = 72

const visibleDevices = computed(() => {
  if (!selectedRoom.value) return []
  const room = selectedRoom.value
  const devices = room.devices || []
  const pos = displayPos(room)
  return devices.map((dev, i) => {
    const angle = (2 * Math.PI * i) / devices.length - Math.PI / 2
    return {
      ...dev,
      index: i,
      x: pos.x + Math.cos(angle) * deviceRadius,
      y: pos.y + Math.sin(angle) * deviceRadius,
    }
  })
})

function connectionPath(room) {
  const cx = center.x, cy = center.y
  const pos = displayPos(room)
  const rx = pos.x, ry = pos.y
  const mx = (cx + rx) / 2
  const my = (cy + ry) / 2
  const dx = rx - cx, dy = ry - cy
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const curve = 28
  const px = (-dy / len) * curve
  const py = (dx / len) * curve
  return `M ${cx} ${cy} Q ${mx + px} ${my + py} ${rx} ${ry}`
}
</script>

<template>
  <div class="orbit-app">
    <!-- Header -->
    <header class="orbit-header">
      <div class="header-left">
        <span class="logo">HOME ORBIT</span>
        <span class="live-badge">◉ HOME ASSISTANT LIVE</span>
      </div>
      <div class="header-right">
        <span>FLOORS <strong>2</strong></span>
        <span>ROOMS <strong>12</strong></span>
        <span>SENSORS <strong>4</strong></span>
        <span>UPDATED <strong>08:51</strong></span>
      </div>
    </header>


    <!-- Breadcrumb back button -->
    <Transition name="fade">
      <button v-if="selectedRoom" class="back-btn" @click="goHome">
        ← Home
      </button>
    </Transition>

    <!-- Graph viewport -->
    <div class="graph-viewport">
      <!-- Transparent overlay catches double-clicks on empty space when zoomed -->
      <div v-if="selectedRoom" class="dblclick-overlay" @dblclick="goHome" />
      <div class="graph-container" :style="{ transform: graphTransform }">

        <!-- SVG connection lines -->
        <svg class="connections" :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H">
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
            </radialGradient>
            <!-- Per-room gradients from centre purple → room colour -->
            <linearGradient
              v-for="room in filteredRooms"
              :key="`grad-${room.id}`"
              :id="`grad-${room.id}`"
              :x1="center.x" :y1="center.y"
              :x2="displayPos(room).x"  :y2="displayPos(room).y"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%"   stop-color="#7c3aed" stop-opacity="0.9"/>
              <stop offset="100%" :stop-color="roomColor(room)" stop-opacity="0.7"/>
            </linearGradient>
            <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="dot-glow" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <!-- Ambient glow behind centre -->
          <circle :cx="center.x" :cy="center.y" r="180" fill="url(#centerGlow)" />

          <!-- Soft glow halo layer -->
          <path
            v-for="room in filteredRooms"
            :key="`halo-${room.id}`"
            :d="connectionPath(room)"
            :stroke="`url(#grad-${room.id})`"
            stroke-width="7"
            fill="none"
            :opacity="selectedRoom && selectedRoom.id !== room.id ? 0 : 0.13"
            filter="url(#line-glow)"
          />

          <!-- Main dashed lines (need id for mpath) -->
          <path
            v-for="room in filteredRooms"
            :id="`mpath-${room.id}`"
            :key="`path-${room.id}`"
            :d="connectionPath(room)"
            :stroke="`url(#grad-${room.id})`"
            stroke-width="1"
            fill="none"
            stroke-dasharray="5 9"
            :opacity="selectedRoom && selectedRoom.id !== room.id ? 0 : 0.55"
            class="flow-path"
          />

          <!-- Travelling dots -->
          <circle
            v-for="room in filteredRooms"
            :key="`dot-${room.id}`"
            r="2.5"
            :fill="roomColor(room)"
            filter="url(#dot-glow)"
            :opacity="selectedRoom && selectedRoom.id !== room.id ? 0 : 0.85"
          >
            <animateMotion
              :dur="`${2.4 + (room.id % 5) * 0.65}s`"
              repeatCount="indefinite"
              calcMode="linear"
            >
              <mpath :href="`#mpath-${room.id}`"/>
            </animateMotion>
          </circle>

          <!-- Selected: bright glow + crisp line on top -->
          <template v-if="selectedRoom">
            <path
              :d="connectionPath(selectedRoom)"
              :stroke="roomColor(selectedRoom)"
              stroke-width="10"
              fill="none"
              opacity="0.18"
              filter="url(#line-glow)"
            />
            <path
              :d="connectionPath(selectedRoom)"
              :stroke="`url(#grad-${selectedRoom.id})`"
              stroke-width="1.5"
              fill="none"
              stroke-dasharray="8 6"
              opacity="0.95"
              class="flow-path-active"
            />
            <!-- Device connection lines -->
            <line
              v-for="device in visibleDevices"
              :key="`devline-${device.id}`"
              :x1="selectedRoom.ax" :y1="selectedRoom.ay"
              :x2="device.x" :y2="device.y"
              :stroke="roomColor(selectedRoom)"
              stroke-width="1"
              stroke-dasharray="3 5"
              opacity="0.35"
            />
          </template>
        </svg>

        <!-- Center node -->
        <div
          class="node center-node"
          :style="{ left: center.x + 'px', top: center.y + 'px' }"
          @click.stop="goHome"
        >
          <div class="center-ring" />
          <div class="center-content">
            <div class="center-label">AVG INDOOR</div>
            <div class="center-temp">20.0<span class="unit">°C</span></div>
            <div class="center-sub">12 rooms · 3 sensors</div>
          </div>
        </div>

        <!-- Room nodes -->
        <div
          v-for="room in filteredRooms"
          :key="room.id"
          class="node room-node"
          :class="{
            selected: selectedRoom?.id === room.id,
            dimmed: selectedRoom && selectedRoom?.id !== room.id,
            dragging: dragging?.room?.id === room.id,
          }"
          :style="{
            left: displayPos(room).x + 'px',
            top: displayPos(room).y + 'px',
            '--room-color': roomColor(room),
          }"
          @mousedown.stop="onNodeMouseDown(room, $event)"
          @mouseenter="hoveredRoom = room"
          @mouseleave="hoveredRoom = null"
        >
          <div class="room-info">
            <div class="room-name">{{ room.name }}</div>
            <div class="room-floor">{{ room.floor }} floor</div>
            <div v-if="room.temp !== null" class="room-stats">
              {{ room.temp }}°C · {{ room.hum }}%
            </div>
            <div v-else class="room-no-sensor">no sensor</div>
          </div>
          <div class="room-dot" />
        </div>

        <!-- Device nodes (shown when a room is selected) -->
        <TransitionGroup name="device-pop">
          <div
            v-for="device in visibleDevices"
            :key="`dev-${device.id}`"
            class="node device-node"
            :style="{
              left: device.x + 'px',
              top: device.y + 'px',
              '--room-color': roomColor(selectedRoom),
              transitionDelay: `${device.index * 40}ms`,
            }"
            @click.stop @dblclick.stop
          >
            <span class="device-icon">{{ device.icon }}</span>
            <div class="device-info">
              <div class="device-name">{{ device.name }}</div>
              <div class="device-state" :class="`state-${device.state}`">{{ device.state }}</div>
            </div>
          </div>
        </TransitionGroup>

      </div>
    </div>


    <!-- Legend -->
    <footer class="legend">
      <button
        v-for="(color, floor) in floorColor"
        :key="floor"
        class="legend-item"
        :class="{ active: activeFloorFilter === floor }"
        @click="toggleFloorFilter(floor)"
      >
        <span class="legend-dot" :style="{ background: color }" />
        {{ floor }} floor
      </button>
      <Transition name="fade">
        <button v-if="hasCustomPositions" class="reset-btn" @click="resetPositions">
          <span class="legend-dot" style="background: #475569" />
          reset layout
        </button>
      </Transition>
    </footer>
  </div>
</template>

<style scoped>
.orbit-app {
  width: 100vw;
  height: 100vh;
  background: #080b14;
  background-image:
    radial-gradient(ellipse at 50% 40%, rgba(88, 28, 220, 0.12) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 40%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', system-ui, sans-serif;
  color: #e2e8f0;
  position: relative;
}

/* Header */
.orbit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  z-index: 10;
  flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 16px; }
.logo {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #fff;
}
.live-badge {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: #6ee7b7;
  opacity: 0.7;
}
.header-right {
  display: flex;
  gap: 20px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #64748b;
  text-transform: uppercase;
}
.header-right strong { color: #e2e8f0; }

/* Back button */
.back-btn {
  position: absolute;
  top: 56px;
  left: 24px;
  z-index: 20;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: #e2e8f0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}
.back-btn:hover { background: rgba(255,255,255,0.12); }

/* Graph viewport */
.graph-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dblclick-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  cursor: zoom-out;
}

.graph-container {
  position: relative;
  width: 1000px;
  height: 680px;
  flex-shrink: 0;
  transform-origin: center center;
  transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

/* SVG lines */
.connections {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.flow-path {
  animation: flow-dash 4s linear infinite;
}
.flow-path-active {
  animation: flow-dash-active 2s linear infinite;
}
@keyframes flow-dash {
  from { stroke-dashoffset: 48; }
  to   { stroke-dashoffset: 0; }
}
@keyframes flow-dash-active {
  from { stroke-dashoffset: 32; }
  to   { stroke-dashoffset: 0; }
}

/* Nodes — base */
.node {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
}

/* Center node */
.center-node {
  z-index: 5;
  cursor: default;
}
.center-ring {
  position: absolute;
  inset: -28px;
  border-radius: 50%;
  border: 1px solid rgba(124, 58, 237, 0.3);
  animation: pulse-ring 3s ease-in-out infinite;
  pointer-events: none;
}
.center-ring::before {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 50%;
  border: 1px solid rgba(124, 58, 237, 0.2);
  animation: pulse-ring 3s ease-in-out infinite 1s;
}
@keyframes pulse-ring {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.04); }
}
.center-content {
  background: radial-gradient(circle, rgba(88, 28, 220, 0.35) 0%, rgba(15, 10, 30, 0.9) 70%);
  border: 1px solid rgba(124, 58, 237, 0.5);
  border-radius: 50%;
  width: 130px;
  height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 0 40px rgba(124, 58, 237, 0.3), inset 0 0 30px rgba(124, 58, 237, 0.1);
}
.center-label {
  font-size: 8px;
  letter-spacing: 0.15em;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.center-temp {
  font-size: 28px;
  font-weight: 300;
  color: #fff;
  line-height: 1;
}
.center-temp .unit { font-size: 14px; }
.center-sub {
  font-size: 9px;
  color: #64748b;
  margin-top: 4px;
  letter-spacing: 0.05em;
}

/* Room nodes */
.room-node {
  z-index: 4;
  animation: float-a 7s ease-in-out infinite;
  transition: opacity 0.5s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.65s cubic-bezier(0.4, 0, 0.2, 1), top 0.65s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: grab;
}
.room-node.dragging {
  cursor: grabbing;
  animation: none !important;
  transition: none;
  z-index: 10;
}
.room-node:nth-child(2n)  { animation-name: float-b; animation-duration: 8.5s; animation-delay: -2.1s; }
.room-node:nth-child(3n)  { animation-name: float-c; animation-duration: 6.8s; animation-delay: -4.3s; }
.room-node:nth-child(4n)  { animation-name: float-a; animation-duration: 9.2s; animation-delay: -1.7s; }
.room-node:nth-child(5n)  { animation-name: float-b; animation-duration: 7.4s; animation-delay: -5.8s; }

@keyframes float-a {
  0%   { transform: translate(-50%, -50%) translate(0px, 0px); }
  25%  { transform: translate(-50%, -50%) translate(3px, -5px); }
  50%  { transform: translate(-50%, -50%) translate(-2px, -7px); }
  75%  { transform: translate(-50%, -50%) translate(-4px, -3px); }
  100% { transform: translate(-50%, -50%) translate(0px, 0px); }
}
@keyframes float-b {
  0%   { transform: translate(-50%, -50%) translate(0px, 0px); }
  30%  { transform: translate(-50%, -50%) translate(-4px, -4px); }
  60%  { transform: translate(-50%, -50%) translate(2px, -6px); }
  80%  { transform: translate(-50%, -50%) translate(4px, -2px); }
  100% { transform: translate(-50%, -50%) translate(0px, 0px); }
}
@keyframes float-c {
  0%   { transform: translate(-50%, -50%) translate(0px, 0px); }
  20%  { transform: translate(-50%, -50%) translate(2px, -3px); }
  45%  { transform: translate(-50%, -50%) translate(5px, -5px); }
  70%  { transform: translate(-50%, -50%) translate(-3px, -6px); }
  100% { transform: translate(-50%, -50%) translate(0px, 0px); }
}

.room-node.selected {
  transform: translate(-50%, -50%) scale(1.1) !important;
  animation: none !important;
}
.room-node.dimmed {
  opacity: 0;
  pointer-events: none;
  filter: blur(0.5px);
}

.room-node > .room-dot {
  position: absolute;
  top: -6px;
  left: -6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--room-color);
  box-shadow: 0 0 8px var(--room-color);
}

.room-icon {
  font-size: 14px;
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.7;
}

.room-info {
  background: rgba(10, 12, 24, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 2px solid var(--room-color);
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 110px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.room-node:hover .room-info,
.room-node.selected .room-info {
  border-color: var(--room-color);
  box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 12px color-mix(in srgb, var(--room-color) 30%, transparent);
}

.room-name {
  font-size: 11px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}
.room-floor {
  font-size: 9px;
  color: var(--room-color);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 1px;
}
.room-stats {
  font-size: 11px;
  color: #cbd5e1;
  margin-top: 4px;
  font-weight: 500;
}
.room-no-sensor {
  font-size: 9px;
  color: #475569;
  margin-top: 4px;
  letter-spacing: 0.05em;
}

/* Device nodes */
.device-node {
  z-index: 6;
  cursor: default;
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(10, 12, 24, 0.88);
  border: 1px solid rgba(255,255,255,0.1);
  border-left: 2px solid var(--room-color);
  border-radius: 20px;
  padding: 5px 10px 5px 7px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px rgba(0,0,0,0.5), 0 0 8px color-mix(in srgb, var(--room-color) 20%, transparent);
  white-space: nowrap;
  pointer-events: none;
}
.device-icon { font-size: 13px; line-height: 1; }
.device-info { display: flex; flex-direction: column; gap: 1px; }
.device-name {
  font-size: 9px;
  font-weight: 600;
  color: #cbd5e1;
  letter-spacing: 0.04em;
}
.device-state {
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #475569;
}
.device-state.state-on { color: #6ee7b7; }
.device-state.state-off { color: #475569; }
.device-state.state-online { color: #6ee7b7; }
.device-state.state-clear { color: #94a3b8; }

.device-pop-enter-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.device-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.device-pop-enter-from,
.device-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.6);
}

/* Room detail panel */
.room-detail {
  position: absolute;
  bottom: 48px;
  right: 24px;
  background: rgba(10, 12, 24, 0.92);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 20px;
  width: 240px;
  backdrop-filter: blur(16px);
  z-index: 20;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.detail-icon { font-size: 24px; }
.detail-name {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
}
.detail-floor {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 2px;
}
.detail-stats {
  display: flex;
  gap: 10px;
}
.stat-card {
  flex: 1;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 10px 8px;
  text-align: center;
}
.stat-label {
  font-size: 9px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 16px;
  font-weight: 500;
  color: #e2e8f0;
}

/* Reset button */
.reset-btn {
  background: none;
  border: none;
  padding: 0;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: color 0.2s;
}
.reset-btn:hover { color: #f87171; }

/* Legend */
.legend {
  display: flex;
  gap: 20px;
  padding: 10px 24px;
  border-top: 1px solid rgba(255,255,255,0.05);
  z-index: 10;
  flex-shrink: 0;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: none;
  border: 1px solid transparent;
  border-radius: 20px;
  padding: 3px 10px 3px 6px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.legend-item:hover {
  color: #94a3b8;
  background: rgba(255,255,255,0.04);
}
.legend-item.active {
  color: #e2e8f0;
  border-color: rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.07);
}
.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active {
  transition: opacity 0.35s, transform 0.35s;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
