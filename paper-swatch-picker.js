/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
import '@polymer/polymer/polymer-legacy.js';

import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import './paper-swatch-picker-icon.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';

/**
This is a simple color picker element that will allow you to choose one
of the Material Design colors from a list of available swatches.

Example:

    <paper-swatch-picker></paper-swatch-picker>

    <paper-swatch-picker color="{{selectedColor}}"></paper-swatch-picker>

You can configure the color palette being used using the `colorList` array and
the `columnCount` property, which specifies how many "generic" colours (i.e.
columns in the picker) you want to display.

    <paper-swatch-picker column-count=5
        color-list='["#65a5f2", "#83be54","#f0d551", "#e5943c", "#a96ddb"]'>
    </paper-swatch-picker>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--paper-swatch-picker-color-size` | Size of each of the color boxes | `20px`
`--paper-swatch-picker-icon` | Mixin applied to the color picker icon | `{}`

@element paper-swatch-picker
@demo demo/index.html
*/
Polymer({
  _template: html`
    <style>
      :host {
        display: inline-block;
        position: relative;
      }

      :host(:focus) {
        outline: none;
      }

      .color {
        box-sizing: border-box;
        width: var(--paper-swatch-picker-color-size, 20px);
        height: var(--paper-swatch-picker-color-size, 20px);
        display: inline-block;
        padding: 0;
        margin: 0;
        cursor: pointer;
        font-size: 0;
        position: relative;
      }

      /* If we just scale the paper-item when hovering, this will end up
       * adding scrollbars to the paper-listbox that are hard to get rid of.
       * An easy workaround is to use an :after pseudo element instead. */
      .color:after {
        @apply --layout-fit;
        background: currentColor;
        content: '';
        -webkit-transition: -webkit-transform 0.2s;
        transition: transform .2s;
        z-index: 0;
      }

      .color:hover:after, .color:focus:after {
        -webkit-transform: scale(1.3, 1.3);
        transform: scale(1.3, 1.3);
        outline: none;
        z-index: 1;
      }

      paper-icon-button {
        @apply --paper-swatch-picker-icon;
      }

      paper-item {
        margin: 0;
        padding: 0;
        min-height: 0;

        --paper-item-focused-before: {
          opacity: 0;
        };
      }

      paper-listbox {
        padding: 0;
        font-size: 0;
        overflow: hidden;
        @apply --layout-vertical;
        @apply --layout-wrap;
      }
    </style>

    <paper-menu-button vertical-align="[[verticalAlign]]" horizontal-align="[[horizontalAlign]]">
      <paper-icon-button id="iconButton" icon="[[icon]]" slot="dropdown-trigger" class="dropdown-trigger" alt="color picker" noink\$="[[noink]]">
      </paper-icon-button>
      <paper-listbox slot="dropdown-content" class="dropdown-content" id="container">
      </paper-listbox>
    </paper-menu-button>
`,

  is: 'paper-swatch-picker',
  hostAttributes: {'tabindex': 0},
  listeners: {'paper-dropdown-open': '_onOpen', 'iron-select': '_onColorTap'},

  /**
   * Fired when a color has been selected
   *
   * @event color-picker-selected
   */

  properties: {
    /**
     * The selected color, as hex (i.e. #ffffff).
     * value.
     */
    color: {type: String, notify: true, observer: '_colorChanged'},

    /**
     * The colors to be displayed. By default, these are the Material Design
     * colors. This array is arranged by "generic color", so for example,
     * all the reds (from light to dark), then the pinks, then the blues, etc.
     * Depending on how many of these generic colors you have, you should
     * update the `columnCount` property.
     */
    colorList: {
      type: Array,
      value: function() {
        return this.defaultColors();
      },
      observer: '_colorListChanged'
    },

    /* The number of columns to display in the picker. This corresponds to
     * the number of generic colors (i.e. not counting the light/dark) variants
     * of a specific color) you are using in your `colorList`. For example,
     * the Material Design palette has 18 colors */
    columnCount: {type: Number, value: 18, observer: '_columnCountChanged'},

    /**
     * The orientation against which to align the menu dropdown
     * horizontally relative to the dropdown trigger.
     */
    horizontalAlign: {type: String, value: 'left', reflectToAttribute: true},

    /**
     * The orientation against which to align the menu dropdown
     * vertically relative to the dropdown trigger.
     */
    verticalAlign: {type: String, value: 'top', reflectToAttribute: true},

    /**
     * The name of the icon to use for the button used as a dropdown trigger.
     * The name should be of the form: `iconset_name:icon_name`.
     * You must manually import the icon/iconset you wish you use.
     */
    icon: {type: String, value: 'swatch:format-color-fill'},

    /**
     * If true, the color picker button will not produce a ripple effect when
     * interacted with via the pointer.
     */
    noink: {type: Boolean}
  },

  attached: function() {
    // Note: we won't actually render these color boxes unless the menu is
    // actually tapped.
    this._renderedColors = false;
    this._updateSize();
  },

  /**
   * Returns the default Material Design colors.
   *
   * @return {Array[string]}
   */
  defaultColors: function() {
    return [
      '#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336',
      '#e53935', '#d32f2f', '#c62828', '#b71c1c', '#fce4ec', '#f8bbd0',
      '#f48fb1', '#f06292', '#ec407a', '#e91e63', '#d81b60', '#c2185b',
      '#ad1457', '#880e4f', '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8',
      '#ab47bc', '#9c27b0', '#8e24aa', '#7b1fa2', '#6a1b9a', '#4a148c',
      '#ede7f6', '#d1c4e9', '#b39ddb', '#9575cd', '#7e57c2', '#673ab7',
      '#5e35b1', '#512da8', '#4527a0', '#311b92', '#e8eaf6', '#c5cae9',
      '#9fa8da', '#7986cb', '#5c6bc0', '#3f51b5', '#3949ab', '#303f9f',
      '#283593', '#1a237e', '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6',
      '#42a5f5', '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1',
      '#e1f5fe', '#b3e5fc', '#81d4fa', '#4fc3f7', '#29b6f6', '#03a9f4',
      '#039be5', '#0288d1', '#0277bd', '#01579b', '#e0f7fa', '#b2ebf2',
      '#80deea', '#4dd0e1', '#26c6da', '#00bcd4', '#00acc1', '#0097a7',
      '#00838f', '#006064', '#e0f2f1', '#b2dfdb', '#80cbc4', '#4db6ac',
      '#26a69a', '#009688', '#00897b', '#00796b', '#00695c', '#004d40',
      '#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50',
      '#43a047', '#388e3c', '#2e7d32', '#1b5e20', '#f1f8e9', '#dcedc8',
      '#c5e1a5', '#aed581', '#9ccc65', '#8bc34a', '#7cb342', '#689f38',
      '#558b2f', '#33691e', '#f9fbe7', '#f0f4c3', '#e6ee9c', '#dce775',
      '#d4e157', '#cddc39', '#c0ca33', '#afb42b', '#9e9d24', '#827717',
      '#fffde7', '#fff9c4', '#fff59d', '#fff176', '#ffee58', '#ffeb3b',
      '#fdd835', '#fbc02d', '#f9a825', '#f57f17', '#fff8e1', '#ffecb3',
      '#ffe082', '#ffd54f', '#ffca28', '#ffc107', '#ffb300', '#ffa000',
      '#ff8f00', '#ff6f00', '#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d',
      '#ffa726', '#ff9800', '#fb8c00', '#f57c00', '#ef6c00', '#e65100',
      '#fbe9e7', '#ffccbc', '#ffab91', '#ff8a65', '#ff7043', '#ff5722',
      '#f4511e', '#e64a19', '#d84315', '#bf360c', '#efebe9', '#d7ccc8',
      '#bcaaa4', '#a1887f', '#8d6e63', '#795548', '#6d4c41', '#5d4037',
      '#4e342e', '#3e2723', '#fafafa', '#f5f5f5', '#eeeeee', '#e0e0e0',
      '#bdbdbd', '#9e9e9e', '#757575', '#616161', '#424242', '#212121'
    ];
  },

  _onOpen: function() {
    // Fill in the colors if we haven't already.
    if (this._renderedColors)
      return;
    this.$.container.innerHTML = '';
    for (let color of this.colorList) {
      let item = document.createElement('paper-item');
      item.classList.add('color');
      item.innerHTML = item.style.color = color;
      this.$.container.appendChild(item);
    }
    this._renderedColors = true;
  },

  _addOverflowClass: function() {
    this.$.container.toggleClass('opened', true);
  },

  _removeOverflowClass: function() {
    this.$.container.toggleClass('opened', false);
  },

  _onColorTap: function(event) {
    var item = event.detail.item;
    // The inner `span` element has the background color;
    var color = item.style.color;

    // If it's in rgb format, convert it first.
    this.color = color.indexOf('rgb') === -1 ? color : this._rgbToHex(color);
    this.fire('color-picker-selected', {color: this.color});
  },

  _colorChanged: function() {
    this.$.iconButton.style.color = this.color;
  },

  _colorListChanged: function() {
    // Fall back to the first color, if the new color list doesn't contain the
    // selected color. Bad news: the color could be either toLowerCase or
    // uppercase so uhhh try both.
    if (this.color && this.color !== '' &&
        this.colorList.indexOf(this.color) === -1 &&
        this.colorList.indexOf(String(this.color).toLowerCase()) === -1) {
      this.color = this.colorList[0];
    }
    this._updateSize();
  },

  _columnCountChanged: function() {
    this._updateSize();
  },

  /**
   * Takes an rgb(r, g, b) style string and converts it to a #ffffff hex value.
   */
  _rgbToHex: function(rgb) {
    // Split the rgb(r, g, b) string up.
    var split = rgb.split('(')[1].split(')')[0].split(',');

    if (split.length != 3)
      return '';

    // From https://gist.github.com/lrvick/2080648.
    var bin = split[0] << 16 | split[1] << 8 | split[2];
    return (function(h) {
      return '#' + new Array(7 - h.length).join('0') + h;
    })(bin.toString(16).toLowerCase());
  },

  _updateSize: function() {
    // Fit the color boxes in columns. We first need to get the width of
    // a color box (which is customizable), and then change the box's
    // width to fit all the columns.
    var sizeOfAColorDiv =
        this.getComputedStyleValue('--paper-swatch-picker-color-size');
    if (!sizeOfAColorDiv || sizeOfAColorDiv == '') {  // Default value case
      sizeOfAColorDiv = 20;
    } else {
      sizeOfAColorDiv = sizeOfAColorDiv.replace('px', '');
    }

    var rowCount = Math.ceil(this.colorList.length / this.columnCount);
    this.$.container.style.height = rowCount * sizeOfAColorDiv + 'px';
    this.$.container.style.width = this.columnCount * sizeOfAColorDiv + 'px';
    this._renderedColors = false;
  }
});
