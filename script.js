// This object mimics how a Fetch API call works
const ApiService = {
    async getAll() {
        const data = localStorage.getItem('transactions');
        return data ? JSON.parse(data) : [];
    },

    async save(transaction) {
        const transactions = await this.getAll();
        transactions.push({ ...transaction, id: Date.now() });
        localStorage.setItem('transactions', JSON.stringify(transactions));
        return { success: true };
    },

    async delete(id) {
        let transactions = await this.getAll();
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        return { success: true };
    }
};

const form = document.getElementById('account-form');
const historyBody = document.getElementById('history-body');

// UI Update Function
async function updateUI() {
    const data = await ApiService.getAll();
    historyBody.innerHTML = '';

    // Calculation Objects
    let totals = {
        global: 0,
        globalAdd: 0,
        globalCost: 0,
        mw: { add: 0, cost: 0 },
        bw: { add: 0, cost: 0 },
        ow: { add: 0, cost: 0 }
    };

    data.forEach(item => {
        const amt = parseFloat(item.amount);
        
        // Calculate Totals logic
        if (item.type === 'add') {
            totals[item.category].add += amt;
            totals.global += amt;
            totals.globalAdd += amt;
        } else {
            totals[item.category].cost += amt;
            totals.global -= amt;
            totals.globalCost -= amt;
        }

        // Render Table Row
        const row = `
            <tr>
                <td>${item.date}</td>
                <td>${item.description}</td>
                <td>${item.category.toUpperCase()}</td>
                <td class="${item.type}-text">${item.type.toUpperCase()}</td>
                <td>${amt.toFixed(2)}</td>
                <td><button onclick="deleteEntry(${item.id})">Del</button></td>
            </tr>
        `;
        historyBody.insertAdjacentHTML('beforeend', row);
    });

    // Update Dashboard Numbers
    document.getElementById('global-balance').innerText = totals.global.toFixed(2);
    document.getElementById('global-add').innerText = totals.globalAdd.toFixed(2);
    document.getElementById('global-cost').innerText = totals.globalCost.toFixed(2);
    
    ['mw', 'bw', 'ow'].forEach(cat => {
        document.getElementById(`${cat}-add`).innerText = totals[cat].add;
        document.getElementById(`${cat}-cost`).innerText = totals[cat].cost;
        document.getElementById(`${cat}-have`).innerText = (totals[cat].add - totals[cat].cost).toFixed(2);
    });
}

// Event Listeners
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTransaction = {
        description: document.getElementById('description').value,
        amount: document.getElementById('amount').value,
        date: document.getElementById('date').value,
        type: document.getElementById('type').value,
        category: document.getElementById('category').value
    };

    await ApiService.save(newTransaction);
    form.reset();
    updateUI();
});

async function deleteEntry(id) {
    if(confirm('Delete this record?')) {
        await ApiService.delete(id);
        updateUI();
    }
}

// Initial Load
updateUI();


 