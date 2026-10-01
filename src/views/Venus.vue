<script setup>
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { assetUrl } from '../utils/assets.js';
import { usePageScope } from '../composables/usePageScope.js';
import { initIdleControls } from '../utils/idle-controls.js';
import BackIcon from '../components/BackIcon.vue';
const scope = usePageScope();
import MusicPlayer from '../components/MusicPlayer.vue';
import { initVenusSimulation } from '../scripts/venus/venus.js';
import { mountVenus } from '../scripts/venus/model.js';
onMounted(async () => {
  initVenusSimulation(scope);
  initIdleControls(scope);
  const dispose = await mountVenus(document.getElementById('venus-stage'), document.getElementById('venus-3d'));
  if (dispose) scope.onDispose(dispose);
});
</script>

<template>
<RouterLink id="venus-back" to="/#venus" data-idle-hide aria-label="返回个人主页" title="Back"><BackIcon /><span>BACK</span></RouterLink>
  <main class="app">
    <header class="header"><div><p class="eyebrow">Venus observation system · Solar laboratory</p><h1>金星</h1><p class="header-subtitle">金星不是另一个地球，而是另一种可能的结局。</p></div><span class="badge">模型在线 · 1 个会合周期</span></header>
    <section class="panel planet-panel" aria-labelledby="venus-model-title">
      <div class="heading">
        <div><span class="idx">00</span><h2 id="venus-model-title">金星三维模型</h2></div>
        <p>Magellan radar surface model</p>
      </div>
      <div class="planet-stage" id="venus-stage">
        <div id="venus-3d" aria-label="可拖拽旋转和缩放的金星三维模型"></div>
        <section class="planet-intro" id="venus-intro"><button class="intro-title" id="intro-toggle" type="button" aria-expanded="false" aria-controls="venus-intro-content" aria-label="展开金星介绍"><span>Venus profile</span><small id="intro-toggle-hint">点此展开介绍</small></button><div class="intro-divider" aria-hidden="true"></div>
          <button class="atmosphere-profile-tag" type="button" :data-image-full="assetUrl('images/venus/venus-atmosphere-profile.png')" data-image-dialog-title="金星大气层纵向剖面" data-image-subtitle="从近地表的高压二氧化碳，到约 80 千米高度的云层与霾层结构。" aria-label="放大金星大气层纵向剖面图并查看说明">
            <span class="atmosphere-kicker">Atmospheric profile</span><img :src="assetUrl('images/venus/venus-atmosphere-profile.png')" alt="金星大气层温度、压力、云层与霾层的纵向剖面图" loading="lazy"><strong>金星大气层纵向剖面</strong><small>温度、压力与多层硫酸云的高度分布</small>
          </button>
          <p id="venus-intro-content">金星，中国古称太白，西方以女神维纳斯命名，是太阳系中距离太阳第二近的行星，平均距离太阳约1.082亿千米，也就是大概0.73个天文单位。金星平均半径约为6052km，质量约为4.87 × 10²⁴ kg，地表平均重力加速度约8.87 m/s²,公转周期约224.7地球日，自转周期约243地球日，主要由岩石和金属构成，拥有地幔包裹液态金属核心的分层内部结构，是一颗相当标准的类地行星。</p>
          <p>金星的地表岩石是暗灰或红褐色的玄武岩，并不是金色的。至于你在右侧看到的金星，则是根据麦哲伦号探测器的雷达遥测数据生成的伪色建模，是人们对真实金星地表的视觉呈现，并不是金星在太空中“用眼睛看起来”的模样，我们会在后面讲到为什么金星看起来是金色的。</p>
          <p>金星的地表温度约为462摄氏度，是太阳系中最热的行星之一（如果考虑平均气温，则金星将当之无愧地成为太阳系最热的行星）。地表大气压约为90个标准大气压。大气的主要成分为CO₂和N₂，SO₂，CO，水蒸气以及少量惰性气体，天空中的厚重云层则主要由硫酸液滴构成，这套大气结构拥有非常强力的温室效应，也直接造成了金星的极端环境。</p>
          <p>在开始时，我们提到为什么右图看起来“不那么真实”：如果你能进入金星大气层近距离观察金星，你会发现这颗行星被达50~70km的厚重云层覆盖，这种云层选择性地过滤了阳光，让照在地表的“阳光”变为了橙黄色，将暗色的岩石渲染成了黄褐色，这也导致为什么右边的贴图是伪色图。</p>
          <p>用肉眼观察的话，它一般看起来呈现出平滑的淡黄色或乳白色，这也是为什么人们称其为金星。而且这种反射光非常明亮，这是因为硫酸云层反射了大量的太阳光，使得其最高视星等达到 -4.9等，成为夜空中除月亮外最醒目的天体。中国古人常说的启明与长庚就分别对应金星清晨见于东方与黄昏见于西方的时候，你可以在后面找到它的演示。</p>
          <p>如果你能从黄道面上方，太阳北极俯瞰太阳系，你会发现金星是顺时针自转的，与大多数行星的逆时针自转相反，因此你在金星上看到的太阳是西升东落的。而且由于它的自转极其缓慢，在金星上，“一天”甚至比“一年”还要来的长,（这里指一个标准的恒星日，如果你只是想在金星上观察一次完整日的出日落，那大约只要117个地球日就好了）这种情况的成因也尚未形成定论。</p>
          <p>金星的内部热量释放不同于地球，主要通过地幔对流，上涌到地表凝固来释放热量，这也造就了金星表面不同于地球的各种地质地貌结构，你可以在下面找到一部分金星表面很有趣的地质特征，更有趣的是金星没有表现出清晰的板块构造系统，但仍然拥有类似地球造山带的典型地貌特征；以及在拥有近地质量与活跃地幔昭示其液态金属核心的情况下，金星的内禀磁场几乎不存在。</p>
          <p>倘若你愿意比较一下金星与地球的初始条件，你会发现两者可能具有一个相似的起点:含水的岩石行星，可这样的开始却演化出了截然不同的结局。地球是生命的摇篮，而金星则成了生灵的止境。</p>
          <p>为什么会有这样截然不同的差异呢？为什么金星会变成这样呢？究竟在哪里出现了分歧？生命的诞生在星球表面的演化扮演了怎样的角色？人类的活动是否会让地球也迈向金星的道路？我同样十分好奇，但对现在的人类来说，这都是留待未来去探索的问题。</p>
          <p>了解金星，能帮我们理解温室效应，大气逃逸，火山活动，行星演化的内外部规律与行星宜居性的判断————人类曾以为金星亦可成为第二个家园。因此，当我们仰望夜空中最耀眼的行星时，不应该想到夺目光芒下的死寂炼狱，也应当思考它为人类的发展带来了怎样的启示，以及我们将从这启示中得到什么。</p>
        </section>
        <p class="planet-hint">拖动旋转 · 滚轮或双指缩放</p>
        <div class="planet-fallback">3D 模型暂时无法载入，请刷新页面。</div>
      </div>
    </section>
    <section class="panel appearance-panel" aria-labelledby="venus-appearance-title">
      <div class="heading">
        <div><span class="idx">01A</span><h2 id="venus-appearance-title">金星地表外观</h2></div>
      </div>
      <div class="appearance-grid">
        <button class="appearance-card" type="button" :data-image-full="assetUrl('images/venus/venus-ishtar-overhead.jpg')" data-image-caption="麦哲伦号拍摄的伊什塔尔高地西部拉克什米平原俯视雷达图，包含萨卡加维亚帕特拉山，它是金星上的一座甚大型盾状火山。来源：NASA/JPL，PIA00485。">
          <figure><img :src="assetUrl('images/venus/venus-ishtar-overhead.jpg')" alt="伊什塔尔高地西部拉克什米平原的麦哲伦雷达俯视图" loading="lazy"></figure>
          <div class="appearance-copy"><h3>伊什塔尔高地俯视雷达图</h3><p>拉克什米平原及其大型破火山口的麦哲伦俯视图。</p><small class="appearance-source">NASA/JPL · PIA00485</small></div>
        </button>
        <button class="appearance-card" type="button" :data-image-full="assetUrl('images/venus/venus-user-maat-mons.png')" data-image-caption="玛阿特山三维视图之一，人类通过研究它第一次获得了金星现代火山活动的直接地质证据。来源：NASA/JPL，PIA00254">
          <figure><img :src="assetUrl('images/venus/venus-user-maat-mons.png')" alt="玛阿特山三维视图之一。来源：NASA/JPL，PIA00254" loading="lazy"></figure>
          <div class="appearance-copy"><h3>玛阿特山三维视图</h3><p>站在玛阿特山以北560km处看向这座盾状火山。</p><small class="appearance-source">NASA/JPL · PIA00254</small></div>
        </button>
        <button class="appearance-card" type="button" :data-image-full="assetUrl('images/venus/venus-venera13-color.jpg')" data-image-caption="苏联金星十三号着陆器传回的首批金星彩色全景之一，是人类第一次从照片中看见曾经被称为“地狱表面”的00金星。来源：NASA APOD / NSSDC，苏联金星探测计划。">
          <figure><img :src="assetUrl('images/venus/venus-venera13-color.jpg')" alt="苏联金星十三号着陆器传回的金星彩色地表全景" loading="lazy"></figure>
          <div class="appearance-copy"><h3>苏联金星十三号的彩色地表视角</h3><p>着陆器在地表传回的首批彩色全景图像之一。</p><small class="appearance-source">NASA APOD · NSSDC · VENERA 13</small></div>
        </button>
        <button class="appearance-card" type="button" :data-image-full="assetUrl('images/venus/venus-venera14-remapped-color.png')" data-image-caption="苏联金星十四号地表图像的重映射彩色版本，展示金星表面的黄橙色天空，在此之前仍有人怀疑苏联是否成功登陆金星。原始数据：苏联金星探测计划。">
          <figure><img :src="assetUrl('images/venus/venus-venera14-remapped-color.png')" alt="经重映射彩色处理的苏联金星十四号金星地表图像" loading="lazy"></figure>
          <div class="appearance-copy"><h3>苏联金星十四号的彩色地表视角</h3><p>重映射彩色处理后呈现的金星近地表全景。</p><small class="appearance-source">VENERA 14 · REMAPPED COLOR</small></div>
        </button>
      </div>
    </section>
    <section class="panel surface-panel" aria-labelledby="venus-surface-title">
      <div class="heading">
        <div><span class="idx">01</span><h2 id="venus-surface-title">金星地表典型的地貌特征</h2></div>
        <p>关于金星</p>
      </div>
      <div class="terrain-grid">
        <article class="terrain-card" :data-image-full="assetUrl('images/venus/venus-volcanic-plains.jpg')" aria-label="放大火山平原与火山地貌图片，并阅读介绍">
          <figure><img :src="assetUrl('images/venus/venus-volcanic-plains.jpg')" alt="NASA Magellan 雷达图中的金星火山平原与火山地貌" loading="lazy"></figure>
          <div class="terrain-copy"><span class="terrain-kicker">Volcanic plains</span><h3>火山平原与火山地貌</h3><p>火山平原是金星地表分布最广的地貌，约覆盖全球表面积的80%，它们由大规模熔岩流反复喷发，铺展，冷却而形成，表面平坦但其内部包含大量火山特征。</p>
            <p>这种平原的广泛分布主要来自于一次三亿年前甚至更早的全球性火山活动“全球再铺面事件”，也是金星看起来没有像月球那样遍布陨石坑，看起来十分年轻的重要原因，因为流动的熔岩覆盖了地表并凝固，形成了新的地表。</p>
            <p>至于火山地貌特征，则有类似夏威夷群岛上的盾状火山，穹丘，由熔岩四散喷发形成的“海葵”构造以及流动熔岩缓慢凝固而形成的，因地表环境迥异而远超地球上任何长度的超长熔岩渠道，大的熔岩渠道甚至可以延伸6000公里以上。</p><small class="terrain-source">Magellan · NASA/JPL · PIA00265</small></div>
        </article>
        <article class="terrain-card" :data-image-full="assetUrl('images/venus/venus-ishtar-terra.jpg')" aria-label="放大大型高地与大陆图片，并阅读介绍">
          <figure><img :src="assetUrl('images/venus/venus-ishtar-terra.jpg')" alt="NASA Pioneer Venus 高程图中的 Ishtar Terra 高地" loading="lazy"></figure>
          <div class="terrain-copy"><span class="terrain-kicker">Highland plateau</span><h3>大型高地与“大陆”</h3><p>称其为“大陆”并不准确，它实际上是人们对金星表面几处明显高于金星平均半径的大型高地的习惯性称呼。它们规模巨大且地形复杂，是金星地壳增厚与强烈地质活动变形的共同结果，主要特点是地势高于金星平均半径与区域地壳明显增厚。</p>
            <p>比较有代表性的高地为其北半球高纬度地区的伊什塔尔高地与阿弗洛狄忒高地，主流观点认为其成因为类似地球造山带的地壳横向挤压和山体隆升。实际由于地形复杂（包含了多种次级地貌单元），且金星实际无明显板块特征与缺乏板块运动，对实际情况的解释尚存在地幔对流上升，大规模火山作用等不少争议观点。</p><small class="terrain-source">Pioneer Venus · NASA/JPL/USGS · PIA00093</small></div>
        </article>
        <article class="terrain-card" :data-image-full="assetUrl('images/venus/venus-yavine-corona.jpg')" aria-label="放大冠状构造图片，并阅读介绍">
          <figure><img :src="assetUrl('images/venus/venus-yavine-corona.jpg')" alt="NASA Magellan 立体视图中的 Yavine 冠状构造" loading="lazy"></figure>
          <div class="terrain-copy"><span class="terrain-kicker">Coronae</span><h3>冠状构造</h3><p>冠状构造是金星上非常独特的一类大型环状地貌，呈环形或椭圆形，直径从几十公里到2500公里不等，看起来可能像是一个陨石坑的中心部分多了隆起、凹陷或变得平坦。</p>
            <p>它们的出现通常伴随火山活动，是金星缺乏板块构造却保持内部活跃的重要证据，这一地貌在太阳系上的其它天体上比较少见，主流模型认为这一地貌的形成与地幔热柱有关，也就是地幔中的热物质缓慢上升凝固后形成的柱状结构。</p><small class="terrain-source">Magellan · NASA/JPL/USGS · PIA00098</small></div>
        </article>
        <article class="terrain-card" :data-image-full="assetUrl('images/venus/venus-ovda-regio.jpg')" aria-label="放大镶嵌地形图片，并阅读介绍">
          <figure><img :src="assetUrl('images/venus/venus-ovda-regio.jpg')" alt="NASA Magellan 雷达图中的 Ovda Regio 镶嵌地形" loading="lazy"></figure>
          <div class="terrain-copy"><span class="terrain-kicker">Tessera terrain</span><h3>镶嵌地形</h3><p>这是金星最古老最复杂的地表单元，形成于前面提到的“全球再铺面事件”之前，一般认为已经存在了五亿年甚至更久，它们往往位于高地内部或被火山平原包围，由两组或更多的山脊与谷地交织而成，呈网格状或拼图状图案，也有如孤岛般独立于这些区块之外的存在。</p>
            <p>它们的形成展现出金星地表多期挤压和伸展的复杂构造史，一些模型认为镶嵌地形是金星早期岩石圈较薄，地幔温度高时形成的“古大陆”残余，这一说法暂无定论，但它们对人类研究金星早期内部动力学和地壳演化具有重要意义。</p><small class="terrain-source">Magellan · NASA/JPL · PIA00218</small></div>
        </article>
      </div>
    </section>
    <section class="grid">
      <article class="panel"><div class="heading"><div><span class="idx">02</span><h2>日心轨道</h2></div><p>俯视</p></div><div class="orbit-stage">
        <svg viewBox="0 0 640 530" role="img" aria-label="地球与金星日心轨道">
          <defs><radialGradient id="sun" cx="36%" cy="31%" r="70%"><stop stop-color="#fffde8"/><stop offset=".24" stop-color="#ffe997"/><stop offset=".66" stop-color="#ffc15b"/><stop offset="1" stop-color="#e9822f"/></radialGradient><radialGradient id="sun-halo"><stop stop-color="#ffd56f" stop-opacity=".46"/><stop offset=".48" stop-color="#ffc25a" stop-opacity=".18"/><stop offset="1" stop-color="#f2a23e" stop-opacity="0"/></radialGradient><radialGradient id="venus"><stop stop-color="#fff8df"/><stop offset=".62" stop-color="#e5bd7d"/><stop offset="1" stop-color="#9f6f42"/></radialGradient></defs>
          <g id="stars" opacity=".3"></g><circle cx="320" cy="265" r="200" class="orbit-line earth-orbit"/><circle cx="320" cy="265" r="144.6" class="orbit-line venus-orbit"/><line id="earth-sun" class="sun-line"/><line id="earth-venus" class="sight-line"/><g id="orbit-sun" class="orbit-sun" transform="translate(320 265)" role="button" tabindex="0" aria-label="播放日心轨道演示" aria-pressed="false"><title>单击播放或暂停日心轨道演示</title><circle class="sun-hit" r="39"/><circle class="sun-halo" r="44" fill="url(#sun-halo)"/><circle class="sun-core" r="24" fill="url(#sun)"/><circle class="sun-focus-ring" r="29"/></g><text x="320" y="310" text-anchor="middle" class="label">太阳</text>
          <g id="earth"><circle r="15" fill="#65b6d9"/><path d="M-13 4Q-4-2 3 2T13-3" fill="none" stroke="#bce9d6" stroke-width="3" opacity=".8"/><circle r="23" fill="none" stroke="rgba(103,190,225,.35)" stroke-dasharray="2 3"/></g><text id="earth-label" text-anchor="middle" class="label blue">地球</text>
          <g id="venus-dot"><circle r="12" fill="url(#venus)"/><circle r="18" fill="none" stroke="rgba(226,187,127,.3)"/></g><text id="venus-label" text-anchor="middle" class="label gold">金星</text>
          <g transform="translate(24 32)"><circle r="4" fill="#70c3e6"/><text x="13" y="4" class="label">地球轨道 · 1 AU</text><circle cx="150" r="4" fill="#d7a964"/><text x="163" y="4" class="label">金星轨道 · 0.723 AU</text></g>
        </svg>
      </div></article>
      <aside class="panel readout"><div class="heading"><div><span class="idx">03</span><h2>我们在地球上能看到什么？</h2></div><span id="type" class="type-badge">昏星</span></div>
        <div class="phase-display"><svg id="phase-svg" viewBox="0 0 100 100"><defs><radialGradient id="phaseGold" cx="36%" cy="32%"><stop stop-color="#fff9e8"/><stop offset=".6" stop-color="#dfb775"/><stop offset="1" stop-color="#7d5634"/></radialGradient></defs><circle cx="50" cy="50" r="43" fill="#050607"/><path id="phase-path" fill="url(#phaseGold)"/><circle cx="50" cy="50" r="43" fill="none" stroke="rgba(239,212,170,.22)"/></svg><div class="phase-copy"><span>当前相位</span><strong id="phase-label">弯月相</strong><small id="lit">25% 被照亮</small></div></div>
        <div class="metrics"><div class="metric"><span>视星等</span><strong id="mag">−4.70</strong><small>数值越小越亮</small></div><div class="metric"><span>太阳距角</span><strong id="elong">46.0°</strong><small id="elong-side">太阳以东</small></div><div class="metric"><span>视直径</span><strong id="diameter">24.0″</strong><small>角秒</small></div><div class="metric"><span>地心距离</span><strong id="distance">0.500 AU</strong><small id="distance-km">75 百万千米</small></div></div>
        <div class="note"><span>此时会看到什么？</span><p id="observation"></p></div>
      </aside>
    </section>
    <section class="secondary">
      <article class="panel"><div class="heading"><div><span class="idx">04</span><h2>地球天空中的视运动</h2></div><label class="trail-control"><span>显示运动轨迹</span><input id="trail-toggle" type="checkbox" checked></label></div><div class="sky-stage"><svg viewBox="0 0 720 250" aria-label="金星在太阳两侧负48度到正48度范围内的横向波浪形视运动轨迹"><line x1="120" y1="122" x2="600" y2="122" class="ecliptic"/><g id="sky-ticks"></g><g id="sky-stars"></g><text x="150" y="30" class="skytext blue">太阳以西 · 晨星</text><text x="570" y="30" text-anchor="end" class="skytext gold">太阳以东 · 昏星</text><circle cx="360" cy="122" r="9" fill="url(#sun)"/><polyline id="trail" class="trail"/><g id="sky-venus"><circle r="13" fill="none" stroke="rgba(244,210,157,.35)"/><circle r="5.4" fill="#f3d5a4"/><text y="-18" text-anchor="middle" class="skytext gold">金星</text></g></svg><small class="sky-credit">BACKGROUND · NASA/GSFC · 2MASS</small></div><div class="sky-caption"><b>◎</b><span>太阳固定在中央，横轴为太阳距角 −48°～+48°。金星从上合经东大距、下合、西大距再回到上合；纵向以约 ±2.6° 的小幅黄纬表现周期摆动,我们在地球上可观察到的金星逆行大约持续40天，金星轨道在地球轨道内侧，此时金星在地球天空中的投影看起来会短暂倒退。<p>（背景银河图展示的金星相位与现实有出入，不可直接用于观星参考）。</p></span></div></article>
      <aside class="panel"><div class="heading"><div><span class="idx">05</span><h2>构型</h2></div><p>跳转</p></div><div id="events" class="events"></div></aside>
    </section>
    <section class="panel timeline"><div class="transport"><button id="play" class="btn play" aria-label="播放日心轨道演示" aria-pressed="false">▶</button><button id="reset" class="btn" aria-label="回到上合">↺</button></div><div class="timeline-main"><div class="timeline-meta"><span>模拟时间</span><strong id="day-label">第 92 天</strong></div><input id="day" class="range" type="range" min="0" max="583.92" step="0.02" value="92"><div class="labels"><span>上合</span><span>东大距</span><span>下合</span><span>西大距</span><span>上合</span></div></div><div class="cycle"><span>回归</span><strong>583.92</strong><small>地球日</small></div></section>
    <section class="panel model"><i>ⓘ</i><div><strong>对这个模型的说明与免责声明</strong><p>该项目旨在科普有关于金星的天文学知识，其轨道按平均半径绘制，并在建模中忽略了很小的离心率；视星等来自距离与相位角的经验光度函数，且模型较为理想，和实际情况存在出入。</p><p>介绍的数据与资料来自NASA：先驱者轨道器，先驱者多轨道探测器，哈雷探测器，麦哲伦号；ESA：金星快车；JAXA：晓号；NPO Lavochkin：金星系列等探测器。</p><p>这个演示仅适合解释规律，不能替代指定日期和地点的精密星历。empty610不对使用本网站演示数据观测失败的结果负任何责任。同时，如果你发现了任何事实或浏览问题，能得到你的反馈我将不胜荣幸。</p></div><div class="speed"><span>播放速度</span><button data-speed=".5">0.5×</button><button class="active" data-speed="1">1×</button><button data-speed="2">2×</button></div></section>
  </main>
  <dialog class="image-dialog" id="image-dialog" aria-labelledby="image-dialog-caption">
    <button class="image-dialog-close" id="image-dialog-close" type="button" aria-label="关闭图片预览">×</button>
    <figure><img id="image-dialog-image" src="" alt=""><figcaption id="image-dialog-caption"></figcaption></figure>
  </dialog>

  <MusicPlayer :track="assetUrl('audio/ad-astra.mp3')" />
</template>

<style src="../assets/styles/venus/venus.css"></style>
<style src="../assets/styles/venus/site.css"></style>
