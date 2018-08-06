export default {
  aor: {
    input: {
      autocomplete: {
        none: ''
      }
    }
  },
  auth: {
    logged_in: 'Logged in',
    logged_out: 'Logged out',
    login: 'Login',
    logout: 'Logout',
    sign_in: 'Sign In',
    sign_up: 'Join'
  },
  pos: {
    about: 'About Chronas',
    account: 'Manage Account',
    back: 'Back',
    community: 'Community Board',
    information: 'Information',
    areas: 'Areas',
    edit: 'Edit',
    goFullScreen: 'Toggle Fullscreen Mode',
    noLinkedContents: 'There are no linked articles yet, consider adding and linking articles.',
    downvote: 'Inappropriate, broken or inaccurate',
    feedbackSuccess: 'Thanks for curating the data!',
    signupToGatherPoints: 'Sign up to get points for your curations',
    pointsAdded: 'Points added to your account',
    mod: 'Modification',
    markers: 'Markers',
    metadata: 'Metadata',
    revisions: 'Revisions',
    images: 'Images',
    search: 'Search',
    map: '',
    layers: 'Layers',
    loading: 'loading...',
    configuration: 'Configuration',
    discover: 'Discover',
    discover_label: 'Discover the year ',
    language: 'Language',
    random: 'Random Article',
    help: 'Intro and Information',
    share: 'Share as link or export image',
    resources: 'Resources',
    users: 'Manage Users',
    upvote: 'Interesting and accurate',
    theme: {
      name: 'Theme',
      light: 'Light',
      dark: 'Dark',
    },
    discover_component: {
      openArticle: 'Open related Wikipedia article',
      hasNoArticle: 'No Wiki article linked yet, please consider editing this item',
      openSource: 'Open source in new tab',
      hasNoSource: 'No source linked yet, please consider editing this item',
      edit: 'Edit this item',
    },
    welcome: 'Welcome',
  },
  resources: {
    areas: {
      fields: {
        province_list: 'Click on provinces to selecect/ deselect',
        display_name: 'Display Name',
        main_ruler_name: 'Main Ruler Name',
        color: 'Area Color',
        main_religion_name: 'Main Religion Name',
        wiki_url: 'Full Wikipedia URL',
        ruler: 'Ruler',
        culture: 'Culture',
        religion: 'Religion',
        capital: 'Capital',
        population: 'Population',
        startYear: 'From Year',
        endYear: 'Until Year'
      }
    },
    linked: {
      fields: {
        description: 'Description or content (if HTML type selected)',
        poster: 'Link to poster image',
        onlyEpicContent: 'Only used as linked part of another article (you will be forwarded to the link form upon saving)',
        src: 'Link to source/ ID'
      }
    },
    users: {
      name: 'User |||| Users',
      fields: {
        username: 'Username',
        name: 'Name',
        createdAt: 'Created at',
        education: 'Education',
        email: 'Email',
        privilege: 'Privilege',
        karma: 'Karma',
      },
      tabs: {
        identity: 'Identity',
        address: 'Address',
        orders: 'Orders',
        reviews: 'Reviews',
        stats: 'Stats',
      },
      page: {
        delete: 'Delete Account',
      },

    },
    page: {
      delete: 'Delete',
    },
    markers: {
      name: 'Marker |||| Markers',
      place_marker: 'Place Marker',
      deleted: 'Marker Deleted',
      fields: {
        name: 'Name',
        url: 'URL',
        coo: 'Coordinates',
        type: 'Type',
        lat: 'Latitude',
        lng: 'Longitude',
        subtype: 'Subtype',
        lastUpdated: 'Last Updated',
        startYear: 'Year Start',
        endYear: 'Year End',
        year: 'Year',
        date: 'Date',
        rating: 'Rating',
      },
      tabs: {
        identity: 'Identity',
        address: 'Address',
        orders: 'Orders',
        reviews: 'Reviews',
        stats: 'Stats',
      },

    },
    revisions: {
      name: 'Revision |||| Revisions',
      fields: {
        name: 'Name',
        type: 'Type',
        resource: 'Resource',
        user: 'User',
        subtype: 'Subtype',
        nextBody: 'Next Body',
        prevBody: 'Prev Body',
        reverted: 'Reverted',
        timestamp: 'Timestamp',
        id: 'Id',
        entityId: 'Entity Id',
      },
    },
    commands: {
      name: 'Order |||| Orders',
      fields: {
        basket: {
          delivery: 'Delivery',
          reference: 'Reference',
          quantity: 'Quantity',
          sum: 'Sum',
          tax_rate: 'Tax Rate',
          total: 'Total',
          unit_price: 'Unit Price',
        },
        customer_id: 'Customer',
        date_gte: 'Passed Since',
        date_lte: 'Passed Before',
        total_gte: 'Min amount',
      },
    },
    products: {
      name: 'Poster |||| Posters',
      fields: {
        category_id: 'Category',
        height_gte: 'Min height',
        height_lte: 'Max height',
        height: 'Height',
        image: 'Image',
        price: 'Price',
        reference: 'Reference',
        stock_lte: 'Low Stock',
        stock: 'Stock',
        thumbnail: 'Thumbnail',
        width_gte: 'Min width',
        width_lte: 'mx_width',
        width: 'Width',
      },
      tabs: {
        image: 'Image',
        details: 'Details',
        description: 'Description',
        reviews: 'Reviews',
      },
    },
    categories: {
      name: 'Category |||| Categories',
      fields: {
        products: 'Products',
      },

    },
    reviews: {
      name: 'Review |||| Reviews',
      fields: {
        customer_id: 'Customer',
        command_id: 'Order',
        product_id: 'Product',
        date_gte: 'Posted since',
        date_lte: 'Posted before',
        date: 'Date',
        comment: 'Comment',
        rating: 'Rating',
      },
      action: {
        accept: 'Accept',
        reject: 'Reject',
      },
      notification: {
        approved_success: 'Review approved',
        approved_error: 'Error: Review not approved',
        rejected_success: 'Review rejected',
        rejected_error: 'Error: Review not rejected',
      },
    },
    segments: {
      name: 'Segments',
      fields: {
        customers: 'Customers',
        name: 'Name',
      },
      data: {
        compulsive: 'Compulsive',
        collector: 'Collector',
        ordered_once: 'Ordered once',
        regular: 'Regular',
        returns: 'Returns',
        reviewer: 'Reviewer',
      },
    },
  },
};
