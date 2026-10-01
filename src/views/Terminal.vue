<script setup>
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { assetUrl } from '../utils/assets.js';
import { usePageScope } from '../composables/usePageScope.js';
import { initIdleControls } from '../utils/idle-controls.js';
import BackIcon from '../components/BackIcon.vue';
const scope = usePageScope();
import MusicPlayer from '../components/MusicPlayer.vue';
import { initTerminal } from '../scripts/terminal/terminal.js';
onMounted(() => {
  initIdleControls(scope);
  initTerminal(scope);
});
</script>

<template>
<div id="terminal" class="terminal-overlay">
    <RouterLink id="terminal-close" class="terminal-close" to="/#dc" data-idle-hide aria-label="Back to main site" title="Back">
      <BackIcon />
      <span>BACK</span>
    </RouterLink>

    <!-- 全局背景过渡层 -->
    <div id="bg-transition"></div>

    <!-- ===== 启动界面 ===== -->
    <div id="boot">
        <div class="b-scanlines" id="bScanlines"></div>

        <!-- 拆分的文字组容器 -->
        <div class="boot-fade-group" id="bootFadeGroup">
            <!-- 徽标（与标题同在一个流式容器里，避免重叠） -->
            <div class="boot-emblem-slot" id="bootEmblemSlot">
                <div class="b-emblem" id="bootEmblem">
                    <div class="b-emblem-periph">
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#f5d98a" />
                                <stop offset="50%" stop-color="#b89438" />
                                <stop offset="100%" stop-color="#7a5c1f" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="1.5" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <circle cx="40" cy="40" r="25" stroke="url(#goldGrad)" stroke-width="1.2" opacity="0.6" />
                        <circle cx="40" cy="40" r="33" stroke="url(#goldGrad)" stroke-width="1" stroke-dasharray="2 5" fill="none" opacity="0.4" class="dash-circle" />
                        <ellipse cx="40" cy="40" rx="35" ry="10.5" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.6" filter="url(#glow)" transform="rotate(-22 40 40)"/>
                        <ellipse cx="40" cy="40" rx="35" ry="10.5" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.6" filter="url(#glow)" transform="rotate(38 40 40)"/>
                    </svg>
                    </div>
                    <div class="b-emblem-core">
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="37" y="23" width="7" height="16" rx="3.5" fill="#b89438" opacity="0.85"/>
                        <rect x="25" y="29" width="30" height="4.5" rx="2" fill="#b89438" opacity="0.6"/>
                        <rect x="37.5" y="39" width="5.5" height="6" rx="1" fill="#b89438" opacity="0.5"/>
                    </svg>
                    </div>
                </div>
            </div>

            <!-- 标题（独立控制） -->
            <div class="b-titles">
                <h1 class="b-t1">DC INS</h1>
                <span class="b-t2">HYBRID NAVIGATION SYSTEM</span>
                <span class="b-t3">EMPTINESS EXPLORATION PROJECT · DELOCALIZED CONFIGURATION</span>
            </div>

            <!-- 状态文字（独立控制） -->
            <div class="b-status" id="boot-status">AWAITING OPERATOR INPUT</div>

            <!-- 按钮（独立控制） -->
            <div class="b-btn-container">
                <button class="b-btn" id="init-btn"><span>INITIATE SYSTEM</span></button>
            </div>
        </div>
    </div>

    <!-- 仅在启动过渡阶段承载徽标，使核心图案能独立上升。 -->
    <div id="floating-emblem" aria-hidden="true"></div>

    <!-- ===== 主 UI ===== -->
    <div id="main-ui">
        <div class="top-bar">
            <div class="title-group">
                <h2 class="main-title">DELOCALIZED CONFIGURATION</h2>
                <div class="sub-title">Emptiness Exploration Project: Navigation System</div>
            </div>
            <div class="clock" id="clockDisplay">15:20:29</div>
        </div>

        <div class="dashboard">
            <div class="orbit-card">
                <div class="card-head">
                    <div class="card-title" id="orbitTitle">Orbital Parameters</div>
                    <div class="orbit-tabs" id="orbitTabs">
                        <button type="button" class="orbit-tab active" data-target="global">Orbital</button>
                        <button type="button" class="orbit-tab" data-target="D1">D1</button>
                        <button type="button" class="orbit-tab" data-target="D2">D2</button>
                        <button type="button" class="orbit-tab" data-target="DR1">DR1</button>
                        <button type="button" class="orbit-tab" data-target="DWS1">DWS1</button>
                    </div>
                </div>

                <div class="orbit-panels" id="orbitPanels">
                    <!-- 全局轨道参数 -->
                    <div class="orbit-panel active" data-panel="global">
                        <div class="orbit-grid">
                            <div class="orbit-item">
                                <span class="label">Altitude</span>
                                <span class="value" id="altitudeVal">400.0</span>
                                <span class="unit">km</span>
                            </div>
                            <div class="orbit-item">
                                <span class="label">Velocity</span>
                                <span class="value" id="velocityVal">7.66</span>
                                <span class="unit">km/s</span>
                            </div>
                            <div class="orbit-item">
                                <span class="label">Inclination</span>
                                <span class="value" id="inclinationVal">51.6</span>
                                <span class="unit">°</span>
                            </div>
                            <div class="orbit-item">
                                <span class="label">Apoapsis</span>
                                <span class="value" id="apoapsisVal">418.1</span>
                                <span class="unit">km</span>
                            </div>
                        </div>
                        <div class="orbit-speed-row">
                            <span class="orbit-speed-label">Rotation Speed</span>
                            <div class="orbit-speed-ctl" id="speedCtl">
                                <button type="button" class="speed-btn active" data-speed="1">1x</button>
                                <button type="button" class="speed-btn" data-speed="0.5">0.5x</button>
                                <button type="button" class="speed-btn" data-speed="0.25">0.25x</button>
                                <button type="button" class="speed-btn" data-speed="0.1">0.1x</button>
                            </div>
                        </div>
                    </div>
                    <!-- 各航天器专属参数面板（由 JS 生成） -->
                </div>
            </div>

            <div class="scene-wrapper" id="sceneWrapper">
                <div id="three-canvas"></div>
                <div class="label-container" id="labelContainer"></div>
            </div>

            <div class="attitude-panel">
                <div class="panel-title">Attitude Control (Multi-Vehicle)</div>
                <div class="multi-attitude-grid">
                    <div class="widget-card selectable" data-sc="D1" style="--sc:#d4a84b;--sc-glow:rgba(212,168,75,0.30);">
                        <div class="circle-deco"></div>
                        <div>
                            <div class="sc-title" style="color:#d4a84b;">D1</div>
                            <div class="data-group">
                                <div class="data-item"><span class="data-label">Pitch</span><span class="data-val" id="pitchVal1">11.7°</span></div>
                                <div class="data-item"><span class="data-label">Roll</span><span class="data-val" id="rollVal1">−3.7°</span></div>
                                <div class="data-item"><span class="data-label">Yaw</span><span class="data-val" id="yawVal1">144.2°</span></div>
                            </div>
                        </div>
                        <span class="view-hint">View</span>
                    </div>
                    <div class="widget-card selectable" data-sc="D2" style="--sc:#6ba7d4;--sc-glow:rgba(107,167,212,0.30);">
                        <div class="circle-deco"></div>
                        <div>
                            <div class="sc-title" style="color:#6ba7d4;">D2</div>
                            <div class="data-group">
                                <div class="data-item"><span class="data-label">Pitch</span><span class="data-val" id="pitchVal2">9.8°</span></div>
                                <div class="data-item"><span class="data-label">Roll</span><span class="data-val" id="rollVal2">−1.2°</span></div>
                                <div class="data-item"><span class="data-label">Yaw</span><span class="data-val" id="yawVal2">210.5°</span></div>
                            </div>
                        </div>
                        <span class="view-hint">View</span>
                    </div>
                    <div class="widget-card selectable" data-sc="DR1" style="--sc:#7ccf8c;--sc-glow:rgba(124,207,140,0.30);">
                        <div class="circle-deco"></div>
                        <div>
                            <div class="sc-title" style="color:#7ccf8c;">DR1</div>
                            <div class="data-group">
                                <div class="data-item"><span class="data-label">Pitch</span><span class="data-val" id="pitchVal3">6.5°</span></div>
                                <div class="data-item"><span class="data-label">Roll</span><span class="data-val" id="rollVal3">4.8°</span></div>
                                <div class="data-item"><span class="data-label">Yaw</span><span class="data-val" id="yawVal3">87.3°</span></div>
                            </div>
                        </div>
                        <span class="view-hint">View</span>
                    </div>
                    <div class="widget-card selectable" data-sc="DWS1" style="--sc:#cf88b0;--sc-glow:rgba(207,136,176,0.30);">
                        <div class="circle-deco"></div>
                        <div>
                            <div class="sc-title" style="color:#cf88b0;">DWS1</div>
                            <div class="data-group">
                                <div class="data-item"><span class="data-label">Pitch</span><span class="data-val" id="pitchVal4">5.2°</span></div>
                                <div class="data-item"><span class="data-label">Roll</span><span class="data-val" id="rollVal4">2.1°</span></div>
                                <div class="data-item"><span class="data-label">Yaw</span><span class="data-val" id="yawVal4">315.8°</span></div>
                            </div>
                        </div>
                        <span class="view-hint">View</span>
                    </div>
                    <div class="status-row">
                        <span class="status-label">Status</span>
                        <span class="status-value" id="statusVal">Nominal</span>
                    </div>
                </div>
            </div>
        </div>
    </div>



  </div>



  <MusicPlayer :track="assetUrl('audio/ad-astra.mp3')" terminal />
</template>

<style src="../assets/styles/terminal/terminal.css"></style>
