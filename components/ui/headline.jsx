function H1({className, children, ...props}) {
    return <h1 className={className} {...props}>{children}</h1>
}

function H2({className, children, ...props}) {
    return <h2 className={className} {...props}>{children}</h2>
}

function H3({className, children, ...props}) {
    return <h3 className={className} {...props}>{children}</h3>
}

function H4({className, children, ...props}) {
    return <h4 className={className} {...props}>{children}</h4>
}

function H5({className, children, ...props}) {
    return <h5 className={className} {...props}>{children}</h5>
}

function H6({className, children, ...props}) {
    return <h6 className={className} {...props}>{children}</h6>
}

// Headline component that accepts a level prop
function Headline({ level = 1, className, children, ...props }) {
    const HeadingComponent = {
        1: H1,
        2: H2,
        3: H3,
        4: H4,
        5: H5,
        6: H6
    }[level] || H1;
    
    return <HeadingComponent className={className} {...props}>{children}</HeadingComponent>;
}

export { H1, H2, H3, H4, H5, H6, Headline }