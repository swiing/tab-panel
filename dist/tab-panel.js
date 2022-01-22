const sheet = new CSSStyleSheet();sheet.replaceSync(`:host {
  display: inline-block;
}

:host([background]) {
  background: var(--background-color, white);
}

#panels { flex-grow:1; display: flex; flex-direction: column;
  margin-top: -1px; /* as per http://stackoverflow.com/questions/27228686/double-borders-div-should-merge-css */
  border-top: 1px solid #eeeeee;
}

#tabs { flex:0 0 content;
  -webkit-user-select: none;
  user-select: none;
  position: relative;
}

/* /* It seems ::slotted + ::before pseudo selectors don't work properly together */
/* #tabs ::slotted(*)::before { */
    /* content: ''; */
    /* /* height: 100%; */
    /* /* left: 50%; */
    /* /* position: absolute; */
    /* /* top: 50%; */
    /* /* transform: translate(-50%, -50%); */
    /* /* width: 100%; */
/* } */

#tabs ::slotted(*) {
  background-color: #fafafa;
  border: 1px solid #eeeeee;
  border-radius: 0 10px 0 0;
  padding: 6px 8px;
  margin: 0;
  text-align: center;
  min-width: 100px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
}

#tabs ::slotted([aria-selected="true"]) {
  background-color: unset;
  font-weight: 600;
  border-bottom: 1px solid var( background-color, transparent);
}

#tabs ::slotted(:focus) {
  z-index: 1; /* make sure focus ring doesn't get buried */
}

#panels ::slotted([aria-hidden="true"]) {
  display: none;
}

/* tabs take screen width on smartphones */
@media (max-width: 1024px) {
  #tabs {
    display: flex;
  }
  #tabs ::slotted(*) {
    flex-grow: 1;
  }
}
`);

var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _TabPanel_instances, _TabPanel_boundOnTitleClick, _TabPanel_boundOnKeyDown, _TabPanel_onTitleClick, _TabPanel_onKeyDown, _TabPanel_findFirstSelectedTab, _TabPanel_selectTab;
const styles = new WeakMap();
// @todo: for now, this allows only one tabpanel in a window
let $selected = -1;
class TabPanel extends HTMLElement {
    // https://stackoverflow.com/a/40494899
    constructor() {
        super();
        _TabPanel_instances.add(this);
        // Not sure why eslint complains here
        // eslint-disable-next-line no-unused-vars
        _TabPanel_boundOnTitleClick.set(this, void 0);
        // Not sure why eslint complains here
        // eslint-disable-next-line no-unused-vars
        _TabPanel_boundOnKeyDown.set(this, void 0);
        const root = this.attachShadow({ mode: 'open' });
        root.innerHTML = `
      <div id="tabs">
        <slot id="tabsSlot" name="title"></slot>
      </div>
      <div id="panels">
        <slot id="panelsSlot"></slot>
      </div>`;
        // @ts-ignore https://github.com/microsoft/TypeScript/issues/30022
        root.adoptedStyleSheets = [sheet];
        this.setAttribute('role', 'tablist');
        const tabsSlot = this.shadowRoot.querySelector('#tabsSlot');
        const panelsSlot = this.shadowRoot.querySelector('#panelsSlot');
        this.tabs = tabsSlot.assignedElements({
            flatten: true,
        });
        this.panels = panelsSlot.assignedElements({ flatten: true });
        // Save refer to we can remove listeners later.
        __classPrivateFieldSet(this, _TabPanel_boundOnTitleClick, __classPrivateFieldGet(this, _TabPanel_instances, "m", _TabPanel_onTitleClick).bind(this), "f");
        __classPrivateFieldSet(this, _TabPanel_boundOnKeyDown, __classPrivateFieldGet(this, _TabPanel_instances, "m", _TabPanel_onKeyDown).bind(this), "f");
        tabsSlot.addEventListener('click', __classPrivateFieldGet(this, _TabPanel_boundOnTitleClick, "f"));
        tabsSlot.addEventListener('keydown', __classPrivateFieldGet(this, _TabPanel_boundOnKeyDown, "f"));
    }
    // eslint-disable-next-line class-methods-use-this
    get selected() {
        return $selected;
    }
    set selected(idx) {
        $selected = idx;
        __classPrivateFieldGet(this, _TabPanel_instances, "m", _TabPanel_selectTab).call(this, idx);
        // in case the button would be set disabled, I enable it.
        // note: instead, I could chose to disallow selecting a disabled button,
        // which would seem quite logical at first. But because this is called
        // programmatically, I assume I know what I am doing.
        this.tabs[idx].disabled = false;
        // Updated the element's selected attribute value when
        // backing property changes.
        this.setAttribute('selected', String(idx));
    }
    connectedCallback() {
        // Add aria role="tabpanel" to each content panel.
        this.panels.forEach((panel) => {
            panel.setAttribute('role', 'tabpanel');
            // panel.setAttribute( "tabindex", 0)
            styles.set(panel, panel.getAttribute('style'));
        });
        this.tabs.forEach((tab) => {
            tab.setAttribute('tabindex', '0');
        });
        this.selected = __classPrivateFieldGet(this, _TabPanel_instances, "m", _TabPanel_findFirstSelectedTab).call(this) || 0;
    }
    disconnectedCallback() {
        const tabsSlot = this.shadowRoot.querySelector('#tabsSlot');
        // @ts-ignore
        tabsSlot.removeEventListener('click', __classPrivateFieldGet(this, _TabPanel_boundOnTitleClick, "f"));
        // @ts-ignore
        tabsSlot.removeEventListener('keydown', __classPrivateFieldGet(this, _TabPanel_boundOnKeyDown, "f"));
    }
}
_TabPanel_boundOnTitleClick = new WeakMap(), _TabPanel_boundOnKeyDown = new WeakMap(), _TabPanel_instances = new WeakSet(), _TabPanel_onTitleClick = function _TabPanel_onTitleClick(e) {
    // https://stackoverflow.com/questions/28900077/why-is-event-target-not-element-in-typescript
    if (e.target?.slot === 'title') {
        this.selected = this.tabs.indexOf(e.target);
        e.target.focus();
    }
}, _TabPanel_onKeyDown = function _TabPanel_onKeyDown(e) {
    let idx;
    switch (e.code) {
        case 'ArrowUp':
        case 'ArrowLeft':
            e.preventDefault(); // unused?
            idx = this.selected - 1;
            idx = idx < 0 ? this.tabs.length - 1 : idx;
            this.tabs[idx].click();
            break;
        case 'ArrowDown':
        case 'ArrowRight':
            e.preventDefault(); // unused?
            idx = this.selected + 1;
            this.tabs[idx % this.tabs.length].click();
            break;
    }
}, _TabPanel_findFirstSelectedTab = function _TabPanel_findFirstSelectedTab() {
    let selectedIdx = -1;
    Object.entries(this.tabs).forEach(([i, tab]) => {
        tab.setAttribute('role', 'tab');
        // Allow users to declaratively select a tab
        // Highlight last tab which has the selected attribute.
        if (tab.hasAttribute('selected'))
            selectedIdx = Number(i);
    });
    return selectedIdx;
}, _TabPanel_selectTab = function _TabPanel_selectTab(idx = -1) {
    Object.entries(this.tabs).forEach(([ndx, tab]) => {
        const i = Number(ndx);
        const select = i === idx;
        // tab.setAttribute("tabindex", select ? 0 : -1 )
        tab.setAttribute('aria-selected', String(select));
        this.panels[i].setAttribute('aria-hidden', String(!select));
        this.panels[i].setAttribute('style', select
            ? styles.get(this.panels[i]) // "display:flex"
            : 'display:none');
        // this is to allow js action on tab selection
        this.panels[i].dispatchEvent(new Event(select ? 'selected' : 'unselected'));
    });
};
customElements.define('tab-panel', TabPanel);

export { TabPanel as default };
