export class SearchableSelect {
    constructor(selectElement, {
        placeholder = 'Search',
        emptyText = 'No matches found',
        maxResults = 60
    } = {}) {
        this.selectElement = selectElement;
        this.placeholder = placeholder;
        this.emptyText = emptyText;
        this.maxResults = maxResults;
        this.options = [];
        this.filteredOptions = [];
        this.activeIndex = -1;
        this.isOpen = false;

        if (!this.selectElement) return;

        this.build();
        this.refreshOptions();
        this.bindEvents();
    }

    build() {
        this.selectElement.classList.add('searchable-select-native');
        this.selectElement.required = false;

        this.root = document.createElement('div');
        this.root.className = 'searchable-select';

        this.inputGroup = document.createElement('div');
        this.inputGroup.className = 'searchable-select-control';

        this.input = document.createElement('input');
        this.input.type = 'search';
        this.input.className = 'form-control searchable-select-input';
        this.input.placeholder = this.placeholder;
        this.input.autocomplete = 'off';
        this.input.role = 'combobox';
        this.input.ariaExpanded = 'false';

        this.clearButton = document.createElement('button');
        this.clearButton.type = 'button';
        this.clearButton.className = 'btn searchable-select-clear d-none';
        this.clearButton.innerHTML = '<i class="bi bi-x-lg"></i>';
        this.clearButton.setAttribute('aria-label', 'Clear selection');

        this.menu = document.createElement('div');
        this.menu.className = 'searchable-select-menu d-none';
        this.menu.role = 'listbox';

        this.inputGroup.append(this.input, this.clearButton);
        this.root.append(this.inputGroup, this.menu);
        this.selectElement.insertAdjacentElement('afterend', this.root);
    }

    bindEvents() {
        this.input.addEventListener('focus', () => this.open());
        this.input.addEventListener('input', () => {
            this.filter(this.input.value);
            this.open();
        });

        this.input.addEventListener('keydown', (event) => this.handleKeydown(event));

        this.clearButton.addEventListener('click', () => {
            this.setValue('', true);
            this.input.focus();
            this.open();
        });

        document.addEventListener('click', (event) => {
            if (!this.root.contains(event.target)) {
                this.close();
            }
        });
    }

    refreshOptions() {
        this.options = Array.from(this.selectElement.options).map((option) => ({
            value: option.value,
            label: option.textContent,
            isPlaceholder: option.value === ''
        }));

        this.setValue(this.selectElement.value, false);
        this.filter('');
    }

    filter(searchTerm) {
        const query = String(searchTerm || '').trim().toLowerCase();
        const matches = this.options.filter((option) => {
            if (!query) return true;
            return option.label.toLowerCase().includes(query);
        });

        this.filteredOptions = matches.slice(0, this.maxResults);
        this.activeIndex = this.filteredOptions.length ? 0 : -1;
        this.renderMenu(matches.length);
    }

    renderMenu(totalMatches) {
        this.menu.innerHTML = '';

        if (!this.filteredOptions.length) {
            const empty = document.createElement('div');
            empty.className = 'searchable-select-empty';
            empty.textContent = this.emptyText;
            this.menu.appendChild(empty);
            return;
        }

        this.filteredOptions.forEach((option, index) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = `searchable-select-option ${index === this.activeIndex ? 'active' : ''}`;
            item.role = 'option';
            item.textContent = option.label;
            item.dataset.value = option.value;
            item.addEventListener('mousedown', (event) => event.preventDefault());
            item.addEventListener('click', () => this.setValue(option.value, true));
            this.menu.appendChild(item);
        });

        if (totalMatches > this.filteredOptions.length) {
            const more = document.createElement('div');
            more.className = 'searchable-select-more';
            more.textContent = `Showing first ${this.filteredOptions.length} matches. Keep typing to narrow it down.`;
            this.menu.appendChild(more);
        }
    }

    setValue(value, shouldNotify) {
        const normalizedValue = String(value || '');
        const selectedOption = this.options.find((option) => String(option.value) === normalizedValue);

        this.selectElement.value = normalizedValue;
        this.input.value = selectedOption && !selectedOption.isPlaceholder ? selectedOption.label : '';
        this.clearButton.classList.toggle('d-none', !normalizedValue);
        this.filter('');
        this.close();

        if (shouldNotify) {
            this.selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    open() {
        this.isOpen = true;
        this.menu.classList.remove('d-none');
        this.input.ariaExpanded = 'true';
    }

    close() {
        this.isOpen = false;
        this.menu.classList.add('d-none');
        this.input.ariaExpanded = 'false';

        const selectedOption = this.options.find((option) => String(option.value) === String(this.selectElement.value || ''));
        if (!this.selectElement.value || !selectedOption || selectedOption.isPlaceholder) {
            this.input.value = '';
            return;
        }

        this.input.value = selectedOption.label;
    }

    handleKeydown(event) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.moveActive(1);
            this.open();
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.moveActive(-1);
            this.open();
        }

        if (event.key === 'Enter' && this.isOpen && this.activeIndex >= 0) {
            event.preventDefault();
            const option = this.filteredOptions[this.activeIndex];
            this.setValue(option.value, true);
        }

        if (event.key === 'Escape') {
            this.close();
        }
    }

    moveActive(step) {
        if (!this.filteredOptions.length) return;

        this.activeIndex = (this.activeIndex + step + this.filteredOptions.length) % this.filteredOptions.length;
        Array.from(this.menu.querySelectorAll('.searchable-select-option')).forEach((item, index) => {
            item.classList.toggle('active', index === this.activeIndex);
        });
    }

    hasUncommittedSearch() {
        const selectedOption = this.options.find((option) => String(option.value) === String(this.selectElement.value || ''));
        const selectedLabel = selectedOption && !selectedOption.isPlaceholder ? selectedOption.label : '';
        return this.input.value.trim() !== selectedLabel;
    }
}
