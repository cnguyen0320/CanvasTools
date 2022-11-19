const DELIMITER = "\t"

/**
 * Downloads a string as file
 * @param {String} filename 
 * @param {String} text 
 */
let download = (filename, text) => {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }
  

let submissions_report_tsv = (submissions, bygroup=false)=>{

    // handle no submissions
    if(submissions.length == 0){
        throw "No submissions found"
    }
    if(submissions.errors){
        throw submissions.errors[0].message
    }

    // start making rows
    let rows = []

    // form headers
    let headers = ["Name"]
    let rubric_mapping = {}

    // Use the first submission to generate headers, assignment name
    let first_submission = submissions[0]
    let assignment_name = first_submission.assignment.name

    let assignment_rubric = first_submission.assignment.rubric
    for(let i in assignment_rubric){

        let rubric_item = assignment_rubric[i]

        // insert description as header
        headers.push(rubric_item.description)


        // mapping maps an index to the rubric id
        rubric_mapping[rubric_item.id] = i
    }

    // generate a total column at the end
    headers.push("Total")
    
    // add headers to row
    rows.push(headers.join(DELIMITER))

    // generate row for each submission
    for(let i in submissions){

        let submission = submissions[i]
        let row = []
        

        // skip over null submission types
        if(submission.submission_type === null){
            continue
        }

        // first column is name
        if(bygroup){
            try{
                row.push(submission.group.name)
            }catch{
                row.push(submission.user.name) // use submitter name if group is not available
            }
        }else{
            row.push(submission.user.name)
        }

        // loop over rubric mapping to maintain order and add grades
        let rubric_assessment = submission.rubric_assessment

        for(let r in rubric_mapping){
            try{
                row.push(rubric_assessment[r].points)
            }
            catch (e) {
                row.push("") // push empty score if points does not exist
            }
        }

        // push the total score
        row.push(submission.score)

        rows.push(row.join(DELIMITER))
    }

    // done iterating over submissions. generate the raw string by delimiting by newline
    return [assignment_name , rows.join("\n")]

}

get_submission_btn = document.getElementById("get_submission")
let get_submission_report = () =>{
    
    let spinner = document.getElementById("get_submission_loader")
    spinner.hidden = false
    get_submission_btn.hidden = true

    let params = {
        base: `/proxy/${document.getElementById("base_url").value}`,
        assignment_id: document.getElementById("submission_assignment").value,
        include: ["rubric_assessment", "assignment", "group", "user"],
        grouped: true
    }

    // manipulate the query based on course vs section
    if(document.getElementById("submission_select_type").value == "course"){
        params.course_id= document.getElementById("submission_group_section").value
    }else{
        params.section_id= document.getElementById("submission_group_section").value
    }
    
    // call get submissions
    get_submissions(
        document.getElementById("token").value, 
        params
    )    
    .then(response =>response.json())
    .then(response => {
        let parse_results = submissions_report_tsv(response, document.getElementById("submission_groups").checked)
        download(`${parse_results[0]}_SubmissionReport.tsv`, parse_results[1])
    })
    .catch((err)=>{
        console.log(err)
        alert(`An error occurred\n${err}`)

    })
    .finally( () =>{
        spinner.hidden = true
        get_submission_btn.hidden = false
    })
}
    get_submission_btn.onclick = get_submission_report

// helper function for cookie read
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

let manage_cookies = () =>{   
    
    Array.from(document.getElementsByClassName("cookied_value")).forEach(element =>{
        
        // read cookie on first load
        element.value = getCookie(element.id)
        
        // set cookies when value changes
        element.addEventListener("change", ()=>{
            const d = new Date();
            d.setTime(d.getTime() + (365*24*60*60*1000));
            let expires = "expires="+ d.toUTCString();
            document.cookie = element.id + "=" + element.value + ";" + expires + ";path=/";
        })
    })
}
manage_cookies()

let base_url = document.getElementById("base_url")

// remove backslash of base url
base_url.addEventListener("change", ()=>{
    base_url.value = base_url.value.trim()
    if(base_url.value.slice(-1) === "/"){
        base_url.value = base_url.value.slice(0, -1)
    }
})
