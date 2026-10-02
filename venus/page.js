import { mountVenus } from './model.js?v=20261002-model-controls';
mountVenus(document.getElementById('venus-stage'), document.getElementById('venus-3d'));
const backButton = document.getElementById('venus-back');
if (location.protocol === 'file:') backButton.href = '../index.html#venus';
