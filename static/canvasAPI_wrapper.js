/**
 * Generates the headers for a fetch request
 * @param {Object} headers a key/value Object containing header and the values
 * @returns Headers Object
 */
let form_header = (headers) =>{
    let fetch_headers = new Headers()

    // iterate over all headers and add it
    for(let key in headers){
        fetch_headers.append(key, headers[key])
    }

    return fetch_headers
}

/**
 * Download Submission data
 * @param {String} token Canvas Token
 * @param {Object} params contains all arguments
 * @returns Promise fetch call and promise
 */
let get_submissions = (token, params=null)=>{

    // generate the endpoint for the request
    let endpoint = params.base
    
    // diverge based on course or section
    if("section_id" in params){
        endpoint += `/api/v1/sections/${params.section_id}/assignments/${params.assignment_id}/submissions`
    }else if("course_id" in params){
        endpoint += `/api/v1/courses/${params.course_id}/assignments/${params.assignment_id}/submissions`
    }

    // add queries
    endpoint += "?"

    // form the query string based on the include
    if("include" in params && params.include !== null){
        let tempArray = []
        for(let arg of params.include){
            tempArray.push(
                `include[]=${arg}`
            )
        }
        
        // add to endpoint
        endpoint +=  tempArray.join("&")
    }

    // group by student groups if requested
    if(params.grouped){
        endpoint += "&grouped=1"
    }

    endpoint+="&per_page=100"

    // get the headers with supplied token
    let headers = form_header({
        Authorization: `Bearer ${token}`,
        "Access-Control-Allow-Origin": "*"
    })

    return fetch(
        endpoint,
        {
            method:'GET',
            headers: headers
        }
    )
    
}
