
export function initRoverData(scope) {
scope.expose('MARS_ROVERS', [
  {
    "id": "perseverance",
    "photo": {"file":"perseverance-surface.jpg","title":"切亚瓦瀑布旁的自拍","note":"2024 年 7 月 23 日，毅力号在杰泽罗陨石坑拍摄的自拍，由机械臂相机的 62 张实拍影像拼接。","credit":"NASA/JPL-Caltech/MSSS","source":"https://science.nasa.gov/resource/perseverances-selfie-with-cheyava-falls/"},
    "concept": {"file":"perseverance-concept.jpg","credit":"NASA/JPL-Caltech","source":"https://www.jpl.nasa.gov/news/press_kits/mars_2020/landing/","note":"毅力号在火星表面开展探测的艺术概念图。"},
    "notesTitle": "不熄求索",
    "notesContent": "毅力号仍在火星上服役。自2021年2月18日着陆起，毅力号已经行驶了42.2公里，并即将打破由机遇号保持的地外行星最长行驶记录。它搭载的“机智”号无人机，在火星上累计完成了72次动力飞行，于2024年1月因视觉导航系统失效而损坏。机智号无人机的使命已然完成，但就如它的名字一样，毅力号的探索仍在继续。",
    "name": "毅力号",
    "en": "Perseverance",
    "agency": "NASA · MARS 2020",
    "color": "#c56a42",
    "lat": 18.44,
    "lon": 77.45,
    "landing": "2021-02-18",
    "site": "杰泽罗陨石坑",
    "region": "Jezero Crater",
    "coverage": "前 1,000 个火星日",
    "period": "2021—2023",
    "routeTitle": "从着陆点到三角洲与湖岸",
    "routeNote": "NASA 前 1,000 个火星日路线档案。图中路线连接实际经过的区域，彩色标记对应采样点；此图不包含之后的行程。",
    "waypoints": [
      {"name":"奥克塔维娅·巴特勒着陆点","x":0.632,"y":0.771},
      {"name":"塞塔地区／火成岩坑底","x":0.575,"y":0.828},
      {"name":"三角洲前缘／三岔口","x":0.414,"y":0.715},
      {"name":"三角洲顶部与湖岸边缘","x":0.19,"y":0.52}
    ],
    "credit": "NASA/JPL-Caltech/University of Arizona · PIA26231",
    "mapSource": "https://science.nasa.gov/photojournal/1000-days-of-perseverance/",
    "latest": "https://science.nasa.gov/mission/mars-2020-perseverance/location-map/",
    "findings": [
      [
        "潜在生物特征",
        "2024年，毅力号采集到了一块富含有机碳、硫化物、磷酸盐的岩石样本，它被命名为“蓝宝石峡谷”，这种矿物组合通常和微生物活动有关，被NASA称为“人类最接近地外生命的一次发现”。"
      ],
      [
        "古湖泊与三角洲",
        "探地雷达发现在毅力号着陆的三角洲下方，存在一个更古老的三角洲，证明早期火星长期维持着能大规模的稳定水环境，同时发现的各类矿物也暗示了与液态水相关的水文活动。"
      ],
      [
        "岩芯与大气样本封存",
        "这是毅力号除寻找生命以外最重要的使命，即将火星上的岩芯与大气样本封存起，然后择机带回地球，以便科学家使用更优秀的仪器分析，解答火星生命的终极谜题。"
      ],
      [
        "探索载人登火",
        "毅力号进行了MOXIE实验，成功使用火星的二氧化碳制备了氧气，证明了在火星上进行原位资源生产氧气与火箭燃料的可行性。同时，它搭载了机智号(Ingenuity)直升机，成功实现了火星首次动力飞行，扩展了人类地外星球探索手段的边界。"
      ]
    ],
    "sources": [
      [
        "NASA · 毅力号科学成果",
        "https://science.nasa.gov/mission/mars-2020-perseverance/science-highlights/"
      ],
      [
        "NASA · 火星样品档案",
        "https://science.nasa.gov/mission/mars-2020-perseverance/mars-rock-samples/"
      ]
    ]
  },
  {
    "id": "opportunity",
    "photo": {"file":"opportunity-surface.jpg","title":"机遇号最后的全景","note":"2018 年 5—6 月，机遇号拍摄的火星地表全景。由多张影像拼接，采用增强色彩突出地表材料差异。","credit":"NASA/JPL-Caltech/Cornell/ASU","source":"https://science.nasa.gov/photojournal/opportunity-legacy-pan-false-color/"},
    "concept": {"file":"opportunity-concept.jpg","credit":"NASA/JPL/Cornell University","source":"https://science.nasa.gov/photojournal/artists-concept-of-rover-on-mars/","note":"机遇号所属 MER 双车任务的艺术概念图。"},
    "notesTitle": "风沙蔽目",
    "notesContent": "2018年5月下旬，机遇号在奋进坑西缘的毅力谷（Perseverance Valley）附近，遭遇了火星有记录以来最严重的全球性沙尘暴。狂风卷起的沙尘覆盖了机遇号的太阳能板，漫天风沙又隔绝了阳光与电磁信号，使得机遇号既无法得到任何能量补充，又无法得到来自地球的应对策略。最终在2018年6月10日，机遇号后备能源耗尽，与地球进行最后通讯后失联。NASA在半年内发送了1000余次激活通讯均无回应，最终于2019年2月13日宣布结束机遇号任务。",
    "name": "机遇号",
    "en": "Opportunity",
    "agency": "NASA · MER-B",
    "color": "#9a7737",
    "lat": -1.95,
    "lon": -5.53,
    "landing": "2004-01-25",
    "site": "子午线平原",
    "region": "Meridiani Planum",
    "coverage": "最终路线 · 45.16 km",
    "period": "2004—2018",
    "routeTitle": "从鹰坑驶向奋进坑",
    "routeNote": "黄色线从鹰坑出发，经过多个撞击坑，到达奋进坑西缘的毅力谷（Perseverance Valley），并最终在毅力谷结束任务。",
    "waypoints": [
      {"name":"鹰坑","x":0.149,"y":0.049,"dx":-22,"dy":18},
      {"name":"坚忍坑","x":0.163,"y":0.055,"dx":24,"dy":-6},
      {"name":"维多利亚坑","x":0.1795,"y":0.224},
      {"name":"奋进坑与毅力谷","x":0.365,"y":0.676}
    ],
    "credit": "NASA/JPL-Caltech/MSSS · PIA23178",
    "mapSource": "https://science.nasa.gov/photojournal/opportunitys-final-traverse-map/",
    "findings": [
      [
        "证实古代液态水",
        "2004年着陆后不久，机遇号便在“鹰”陨石坑中发现了出富含赤铁矿的小球状结核，这些小球需要在含水环境中形成，是火星液态水存在的首批直接证据。"
      ],
      [
        "水环境存在的遗迹",
        "机遇号在“奋进”坑边寻得多处硫酸盐、氯化物等盐类沉积物，说明了古代湖泊的存在。同时，它也在“维多利亚”坑拍摄到了清晰的交错纹理，展示了当地环境被水改造过的证据。"
      ],
      [
        "更温和的中性水环境",
        "“奋进”坑边缘还寻得了蒙脱石等黏土矿物，石膏矿脉与含硼酸盐的岩石，这些突破性发现揭示了火星的水环境曾发生由酸性向中性转变的事实，暗示了火星曾拥有一个更适合生命存在的环境。"
      ]
    ],
    "sources": [
      [
        "NASA ARES · MER 主要发现",
        "https://ares.jsc.nasa.gov/missions/mer/important-discoveries.html"
      ],
      [
        "NASA · 火星水环境的变化",
        "https://www.nasa.gov/news-release/nasas-opportunity-rover-yields-more-data-on-changes-to-mars-environment/"
      ]
    ]
  },
  {
    "id": "curiosity",
    "photo": {"file":"curiosity-surface.jpg","title":"夏普山上的自拍","note":"2015 年 8 月 5 日，好奇号在夏普山脚的钻探地点自拍；由机械臂相机影像拼接。","credit":"NASA/JPL-Caltech/MSSS","source":"https://science.nasa.gov/photojournal/looking-up-at-mars-rover-curiosity-in-buckskin-selfie/"},
    "concept": {"file":"curiosity-concept.jpg","credit":"NASA/JPL-Caltech","source":"https://science.nasa.gov/photojournal/mars-rover-curiosity-in-artists-concept-wide/","note":"好奇号移动科学实验室的艺术概念图。"},
    "notesTitle": "探赜索隐",
    "notesContent": "好奇号仍在火星上服役。截至2026年9月，好奇号已经在火星上度过了14年，超期服役12年，在夏普山脚下行驶了约28.5公里，将人类对火星的探索由“寻找水的存在”推向了“寻找生命的存在”。目前，它的核动力电池随着放射性元素自然衰变而逐渐下降，尖锐的玄武岩也已经在他的铝制车轮上造成了多处撕裂与破损，纵使自然老化不可避免，好奇号也不会停下探索的脚步，它带给人类的科学遗产仍在持续积累。",
    "name": "好奇号",
    "en": "Curiosity",
    "agency": "NASA · MARS SCIENCE LABORATORY",
    "color": "#547f87",
    "lat": -4.59,
    "lon": 137.44,
    "landing": "2012-08-06",
    "site": "盖尔陨石坑",
    "region": "Gale Crater / Mount Sharp",
    "coverage": "着陆至 2022 年 7 月",
    "period": "2012—2022",
    "routeTitle": "从黄刀湾走向夏普山",
    "routeNote": "NASA 十周年路线总览，采用盖尔陨石坑的倾斜视图。星号标出 2022 年 7 月的大致位置；这是历史总览图，原图分辨率较低，不包含后续行程。",
    "waypoints": [
      {"name":"布拉德伯里着陆点","x":0.285,"y":0.903},
      {"name":"格莱内尔格／黄刀湾","x":0.209,"y":0.912,"dx":-16},
      {"name":"夏普山山麓","x":0.635,"y":0.676},
      {"name":"沿沉积地层向上攀登","x":0.578,"y":0.448}
    ],
    "credit": "NASA/JPL-Caltech · 十周年路线总览",
    "mapSource": "https://www.nasa.gov/history/curiosity-celebrates-10-years-on-mars/",
    "latest": "https://science.nasa.gov/mission/msl-curiosity/location-map/",
    "findings": [
      [
        "古代宜居湖泊",
        "黄刀湾泥岩中的黏土、关键化学元素与能量来源，显示这里曾具备微生物可能利用的宜居条件。"
      ],
      [
        "保存下来的有机分子",
        "SAM 在钻取的岩石样品中检测到有机分子，说明火星岩石可以保存有机物；有机物本身并不能证明存在生命。"
      ],
      [
        "层层岩石记录气候变迁",
        "从古老河床、湖相沉积到夏普山不同地层，建立长期地质记录，追踪水环境及古代气候的变化。"
      ]
    ],
    "sources": [
      [
        "NASA · 好奇号科学成果",
        "https://science.nasa.gov/mission/msl-curiosity/science-highlights/"
      ],
      [
        "NASA · 十年探索回顾",
        "https://www.nasa.gov/history/curiosity-celebrates-10-years-on-mars/"
      ]
    ]
  },
  {
    "id": "spirit",
    "photo": {"file":"spirit-surface.jpg","title":"麦克默多全景","note":"2006 年，勇气号在古谢夫陨石坑越冬时拍摄的全景，包含车体与周围地表；采用增强色彩。","credit":"NASA/JPL-Caltech/Cornell Univ./Arizona State Univ.","source":"https://science.nasa.gov/resource/spirit-mars-rover-in-mcmurdo-panorama-2/"},
    "concept": {"file":"spirit-concept.jpg","credit":"NASA/JPL","source":"https://science.nasa.gov/photojournal/artists-concept-of-mars-exploration-rover/","note":"勇气号所属 MER 双车任务的艺术概念图。"},
    "notesTitle": "沉寂勇气",
    "notesContent": "2004年1月4日，勇气号在古谢夫陨石坑着陆。它在哥伦比亚丘陵的行驶路线达7.73公里，它最早发现了火星的水蚀变与温和水环境。它的设计寿命约90天，实际运行约6年。2009年5月，准备远行的勇气号陷入了一片被称为“特洛伊”的沙地，NASA工程师尝试了多种办法均无法让它脱困，只得让它留在原地继续观测。由于火星车的结构设计问题，被困后的勇气号无法将太阳能板调整到最佳角度获取太阳能，加上火星冬季的严寒与沙暴，最终勇气号因电力衰竭而沉寂，NASA于2011年5月25日宣布勇气号任务结束。",
    "name": "勇气号",
    "en": "Spirit",
    "agency": "NASA · MER-A",
    "color": "#806992",
    "lat": -14.57,
    "lon": 175.47,
    "landing": "2004-01-04",
    "site": "古谢夫陨石坑",
    "region": "Gusev Crater / Columbia Hills",
    "coverage": "最终行驶区域 · Sol 2555 档案",
    "period": "2004—2009 行驶",
    "routeTitle": "从火山平原到哥伦比亚丘陵",
    "routeNote": "NASA 的 Sol 2555 归档路线图。勇气号于 2009 年陷入松软土壤后停止远距离行驶，2010 年最后通信；档案的 Sol 编号不代表一直行驶到那一天。",
    "waypoints": [
      {"name":"哥伦比亚纪念站","x":0.1032,"y":0.1749},
      {"name":"邦纳维尔撞击坑","x":0.1531,"y":0.1153},
      {"name":"哥伦比亚丘陵／赫斯本德山","x":0.719,"y":0.522},
      {"name":"本垒板高地／特洛伊沙地","x":0.796,"y":0.815,"detail":{"x":0.443,"y":0.580}}
    ],
    "overviewMap":{"file":"spirit-overview.jpg","note":"勇气号第 1—1386 火星日路线总览；点击第 4 个地点切换至任务末期的特洛伊局部图。","credit":"NASA/JPL-Caltech/UA/Cornell/NM Museum · PIA10126","source":"https://science.nasa.gov/photojournal/spirits-traverse-sols-1-to-1386/"},
    "credit": "NASA/JPL-Caltech · Spirit traverse Sol 2555",
    "mapSource": "https://science.nasa.gov/resource/spirits-traverse-map-through-sol-2555/",
    "findings": [
      [
        "水蚀矿物与潮湿环境",
        "勇气号对着陆区样本进行岩石钻孔分析时发现了其内部的矿物质结晶，这些结晶需要在含水环境中形成，是火星液态水存在的直接证据，同时也发现了只能在潮湿环境中形成的赤铁矿。"
      ],
      [
        "古代热泉与地热系统",
        "在“哥伦比亚山”地区附近，勇气号先后发现了高纯度的二氧化硅、蛋白石与碳酸盐岩，这些矿物指向古代火星存在的地热活动，暗示了一个可能存在的地热环境，这种环境在地球上常是微生物的理想栖息地。"
      ],
      [
        "水循环",
        "2009年，勇气号在受困挣扎时，车轮刨开的地表意外暴露出了高浓度的硫酸盐物质，科学家认为这些物质的存在证明了火星上曾经存在一个活跃的水循环系统。"
      ]
    ],
    "sources": [
      [
        "NASA ARES · MER 主要发现",
        "https://ares.jsc.nasa.gov/missions/mer/important-discoveries.html"
      ],
      [
        "NASA · 勇气号任务档案",
        "https://science.nasa.gov/mission/mer-spirit/"
      ]
    ]
  },
  {
    "id": "zhurong",
    "photo": {"file":"zhurong-surface.jpg","title":"祝融号与着陆平台合影","note":"祝融号与天问一号着陆平台在火星地表的合影，由巡视器释放的无线相机拍摄，2021 年 6 月公布。","credit":"国家航天局供图／新华社发布","source":"https://www.xinhuanet.com/2021-06/11/c_1127553408.htm"},
    "concept": {"file":"zhurong-concept.png","credit":"Virginio97 · CC0","source":"https://commons.wikimedia.org/wiki/File:Zhurong_Rover.png","note":"祝融号结构与科学仪器示意插画（原图为意大利语标注）。"},
    "notesTitle": "乌托一梦",
    "notesContent": "2022年5月，为应对火星冬季的低温、沙尘暴和低纬度可能存在的降雪情况，祝融号按计划转入休眠模式。CNSA原计划在2022年12月火星春季到来后凭借火星气候的变化来自动唤醒祝融号（核心部件温度达15℃、太阳能板发电功率功率达140瓦即可实现自动唤醒），但至今未能成功唤醒。人们结合近期的卫星照片，推测可能是火星的沙尘混合着降雪形成的絮状物覆盖了太阳能电池板，在积雪融化后板结沙粘结并覆盖了太阳能板导致祝融号核心温度无法上升，最终沉睡在了乌托邦平原之上。尽管对祝融号传回数据的科学分析仍在持续，但它的在轨巡视任务已实际终止。",
    "name": "祝融号",
    "en": "Zhurong",
    "agency": "CNSA · 天问一号",
    "color": "#a84e4e",
    "lat": 25.066,
    "lon": 109.925,
    "landing": "2021-05-15",
    "site": "乌托邦平原南部",
    "region": "Southern Utopia Planitia",
    "coverage": "Sol 11—113 · 研究所用路段",
    "period": "2021 路段档案",
    "routeTitle": "穿行乌托邦平原，探测地下",
    "routeNote": "中科院研究图的右上角 b 图为 Sol 11—113 的实际行进路线。绿色与紫色标记对应雷达识别的地下多边形不同部位；这段约 1.2 km 的研究路线不是完整任务路线。",
    "waypoints": [
      {"name":"着陆点附近／第 11 火星日","x":0.9053,"y":0.0602},
      {"name":"向南巡视与雷达剖面","x":0.878,"y":0.1665},
      {"name":"第 63 火星日附近","x":0.8604,"y":0.2975},
      {"name":"第 113 火星日／本图路段终点","x":0.873,"y":0.5525}
    ],
    "credit": "中国科学院地质与地球物理研究所等 · 2023 年研究图 1",
    "mapSource": "https://www.cas.cn/syky/202311/t20231124_4988326.shtml",
    "findings": [
      [
        "古海洋与地下水活动",
        "祝融号的次表层探测雷达在乌托邦平原地下存在与地球海岸相似的多层倾斜沉积结构，这是迄今为止最直接的古代海洋证据，这也表明火星曾长期维持温暖湿润的环境。"
      ],
      [
        "现代火星与“盐风化”过程",
        "据祝融号传回的火星岩表面的片状剥落与碎裂块体等纹理图片指出，火星岩石至今仍在在被盐与水改变，这涉及盐类的夜间吸潮现象，表明现代火星夜间也可以维持表面相对湿润的条件。"
      ],
      [
        "更悠久的水活动历史",
        "CNSA团队根据祝融号的高频雷达数据分析得到，火星在约7.5亿年前依然存在显著水体活动，同时期地球已然诞生了真核藻类与多细胞生物，并保有数量庞大的单细胞生物群体。祝融号发现的石膏与氯化物等蒸发盐矿物，也进一步揭示了火星上持续的风沙搬运现象与长期稳定的地表水循环过程。"
      ]
    ],
    "sources": [
      [
        "中国科学院 · 近期水活动线索",
        "https://www.cas.cn/cm/202205/t20220513_4834519.shtml"
      ],
      [
        "中国科学院 · 地下古多边形地貌",
        "https://www.cas.cn/syky/202311/t20231124_4988326.shtml"
      ]
    ]
  }
]);
}
