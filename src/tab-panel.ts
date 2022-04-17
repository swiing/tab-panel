// eslint-disable-next-line import/no-useless-path-segments
import stylesheet from "../src/tab-panel.css" assert { type: "css" }

const styles = new WeakMap();

// @todo: for now, this allows only one tabpanel in a window
let $selected = -1;

export default class TabPanel extends HTMLElement {
  tabs: HTMLButtonElement[];

  panels: Element[];

  // Not sure why eslint complains here
  // eslint-disable-next-line no-unused-vars
  #boundOnTitleClick: (e: MouseEvent) => void;

  // Not sure why eslint complains here
  // eslint-disable-next-line no-unused-vars
  #boundOnKeyDown: (e: KeyboardEvent) => void;

  // eslint-disable-next-line class-methods-use-this
  get selected() {
    return $selected;
  }

  set selected(idx: number) {
    $selected = idx;
    this.#selectTab(idx);

    // in case the button would be set disabled, I enable it.
    // note: instead, I could chose to disallow selecting a disabled button,
    // which would seem quite logical at first. But because this is called
    // programmatically, I assume I know what I am doing.
    this.tabs[idx].disabled = false;

    // Updated the element's selected attribute value when
    // backing property changes.
    this.setAttribute('selected', String(idx));
  }

  // https://stackoverflow.com/a/40494899
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' })

    root.innerHTML = `
      <div id="tabs">
        <slot id="tabsSlot" name="title"></slot>
      </div>
      <div id="panels">
        <slot id="panelsSlot"></slot>
      </div>`;

    // @ts-ignore https://github.com/microsoft/TypeScript/issues/30022
    root.adoptedStyleSheets = [ stylesheet ];

    this.setAttribute('role', 'tablist');

    const tabsSlot = this.shadowRoot!.querySelector(
      '#tabsSlot'
    ) as HTMLSlotElement;
    const panelsSlot = this.shadowRoot!.querySelector(
      '#panelsSlot'
    )! as HTMLSlotElement;

    this.tabs = tabsSlot.assignedElements({
      flatten: true,
    }) as HTMLButtonElement[];
    this.panels = panelsSlot.assignedElements({ flatten: true });

    // Save refer to we can remove listeners later.
    this.#boundOnTitleClick = this.#onTitleClick.bind(this);
    this.#boundOnKeyDown = this.#onKeyDown.bind(this);

    tabsSlot.addEventListener('click', this.#boundOnTitleClick);
    tabsSlot.addEventListener('keydown', this.#boundOnKeyDown);
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

    this.selected = this.#findFirstSelectedTab() || 0;
  }

  disconnectedCallback() {
    const tabsSlot = this.shadowRoot!.querySelector('#tabsSlot')!;
    // @ts-ignore
    tabsSlot.removeEventListener('click', this.#boundOnTitleClick);
    // @ts-ignore
    tabsSlot.removeEventListener('keydown', this.#boundOnKeyDown);
  }

  #onTitleClick(e: MouseEvent) {
    // https://stackoverflow.com/questions/28900077/why-is-event-target-not-element-in-typescript
    if ((e.target as HTMLElement)?.slot === 'title') {
      this.selected = this.tabs.indexOf(e.target as HTMLButtonElement);
      (e.target as HTMLButtonElement).focus();
    }
  }

  #onKeyDown(e: KeyboardEvent) {
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
      default:
    }
  }

  #findFirstSelectedTab() {
    let selectedIdx = -1;
    Object.entries(this.tabs).forEach(([i, tab]) => {
      tab.setAttribute('role', 'tab');

      // Allow users to declaratively select a tab
      // Highlight last tab which has the selected attribute.
      if (tab.hasAttribute('selected')) selectedIdx = Number(i);
    });
    return selectedIdx;
  }

  #selectTab(idx = -1) {
    Object.entries(this.tabs).forEach(([ndx, tab]) => {
      const i = Number(ndx)
      const select = i === idx
      // tab.setAttribute("tabindex", select ? 0 : -1 )
      tab.setAttribute('aria-selected', String(select));
      this.panels[i].setAttribute('aria-hidden', String(!select));

      this.panels[i].setAttribute(
        'style',
        select
          ? styles.get(this.panels[i]) // "display:flex"
          : 'display:none'
      );

      // this is to allow js action on tab selection
      this.panels[i].dispatchEvent(
        new Event(select ? 'selected' : 'unselected')
      );
    });
  }
}

customElements.define('tab-panel', TabPanel);
