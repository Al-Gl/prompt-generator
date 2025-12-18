const searchBtn = document.getElementById('searchBtn');
const seedWordInput = document.getElementById('seedWord');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const resultsBody = document.getElementById('resultsBody');
const groundingContent = document.getElementById('groundingContent');
const copyBtn = document.getElementById('copyBtn');
const errorDiv = document.getElementById('error');

let currentResults = [];

// Search functionality
searchBtn.addEventListener('click', async () => {
    const seedWord = seedWordInput.value.trim();

    if (!seedWord) {
        showError('Please enter a seed word');
        return;
    }

    // Reset UI
    hideError();
    results.classList.add('hidden');
    loading.classList.remove('hidden');
    searchBtn.disabled = true;

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ seedWord })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch results');
        }

        const data = await response.json();

        if (data.prompts && data.prompts.length > 0) {
            currentResults = data.prompts;
            displayResults(data.prompts, data.groundingData);
        } else if (data.rawResponse) {
            showError('AI returned unstructured data. Raw response: ' + data.rawResponse);
        } else {
            showError('No prompts found. Try a different seed word.');
        }

    } catch (error) {
        showError(error.message);
    } finally {
        loading.classList.add('hidden');
        searchBtn.disabled = false;
    }
});

// Display results
function displayResults(prompts, groundingData) {
    // Display grounding information
    if (groundingData) {
        const searchQueries = groundingData.searchQueries || [];
        const sources = groundingData.sources || [];

        groundingContent.innerHTML = `
            <div class="mb-3">
                <strong class="text-gray-300">Search Queries Used:</strong>
                <div class="mt-1">${searchQueries.length > 0 ? searchQueries.join(', ') : 'N/A'}</div>
            </div>
            <div>
                <strong class="text-gray-300">Sources (${sources.length}):</strong>
                <div class="mt-1 space-y-1">
                    ${sources.slice(0, 5).map(s => `
                        <a href="${s.uri}" target="_blank" class="text-primary hover:underline block">
                            ${escapeHtml(s.title || s.uri)}
                        </a>
                    `).join('')}
                    ${sources.length > 5 ? `<p class="text-gray-500">... and ${sources.length - 5} more</p>` : ''}
                </div>
            </div>
        `;
    }

    // Display prompts table
    resultsBody.innerHTML = prompts.map((item, index) => {
        const intentColor = {
            'Informational': 'bg-blue-900/30 text-blue-300',
            'Transactional': 'bg-green-900/30 text-green-300',
            'Comparative': 'bg-purple-900/30 text-purple-300'
        }[item.intent] || 'bg-gray-900/30 text-gray-300';

        const scoreColor = item.visibilityScore >= 70 ? 'text-green-400' :
                          item.visibilityScore >= 40 ? 'text-yellow-400' :
                          'text-red-400';

        return `
            <tr class="hover:bg-dark transition-colors">
                <td class="px-6 py-4 text-sm text-gray-300">
                    ${escapeHtml(item.prompt)}
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${intentColor}">
                        ${item.intent}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl font-bold ${scoreColor}">
                            ${item.visibilityScore}
                        </span>
                        <div class="flex-1 h-2 bg-dark-border rounded-full overflow-hidden w-20">
                            <div class="h-full ${scoreColor.replace('text-', 'bg-')}"
                                 style="width: ${item.visibilityScore}%"></div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    results.classList.remove('hidden');
}

// Copy functionality
copyBtn.addEventListener('click', () => {
    const text = currentResults.map(item => item.prompt).join('\n');
    navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy All';
        }, 2000);
    });
});

// Sorting functionality
document.querySelectorAll('[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        const sortBy = th.dataset.sort;
        const isAscending = th.dataset.order !== 'asc';

        currentResults.sort((a, b) => {
            let valA = sortBy === 'score' ? a.visibilityScore : a[sortBy];
            let valB = sortBy === 'score' ? b.visibilityScore : b[sortBy];

            if (typeof valA === 'string') {
                return isAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return isAscending ? valA - valB : valB - valA;
        });

        th.dataset.order = isAscending ? 'asc' : 'desc';
        displayResults(currentResults, null);
    });
});

// Enter key support
seedWordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Error handling
function showError(message) {
    errorDiv.querySelector('p').textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
