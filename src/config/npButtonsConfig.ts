export const buttons = [
    {
        filter: "new-pop-filter",
        text: "SORT",
        iconProps: { name: 'sort', size: 30, color: '#666666',className:'part-icon' },
        subButtons: [
            {
                filter: "popular",
                text: "Popular"
            },
            {
                filter: "new",
                text: "Newest First"
            },
            {
                filter: "old",
                text: "Oldest First"
            }
        ],
    },
    {
        filter: "language-filter",
        text: "FILTER",
        iconProps: { name: 'filter-alt', size: 30, color: '#666666', className:'part-icon'},
        subButtons: [
            {
                filter: "all",
                text: "All"
            },
            {
                filter: "sub",
                text: "Subtitled"
            },
            {
                filter: "dub",
                text: "Dubbed"
            }
        ],
    }
];