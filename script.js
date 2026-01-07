const apiBase = './api';
const form = document.getElementById('studentForm');
const studentsTable = document.getElementById('studentsTable');
const courseSelect = document.getElementById('course_id');
const birthdayInput = document.getElementById('birthday');
const ageInput = document.getElementById('age');

function calcAge(dateString){
  if(!dateString) return '';
  const b = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if(m<0 || (m===0 && today.getDate() < b.getDate())) age--;
  return age;
}

birthdayInput.addEventListener('change', ()=>{ ageInput.value = calcAge(birthdayInput.value); });

async function loadCourses(){
  try{
    const resp = await fetch(apiBase + '/courses.php');
    const json = await resp.json();
    if(json.success){
      courseSelect.innerHTML = json.data.map(c=>`<option value="${c.id}">${c.code} - ${c.name}</option>`).join('');
      return;
    }
    throw new Error('no courses');
  }catch(e){
    // fallback hardcoded options (ensure they match your DB)
    courseSelect.innerHTML = `
      <option value="1">BSCS - Bachelor of Science in Computer Science</option>
      <option value="2">BSIT - Bachelor of Science in Information Technology</option>
      <option value="3">BSBA - Bachelor of Science in Business Administration</option>
    `;
  }
}

async function fetchStudents(){
  try{
    const res = await fetch(apiBase + '/list.php');
    const json = await res.json();
    if(!json.success){ studentsTable.innerHTML = '<tr><td>Error loading data</td></tr>'; return; }

    const rows = json.data.map(s => `
      <tr data-id="${s.id}">
        <td>${s.student_number}</td>
        <td>${s.full_name}</td>
        <td>${s.birthday}</td>
        <td>${s.age}</td>
        <td>${s.course_code} - ${s.course_name}</td>
        <td>${s.current_address || ''}</td>
        <td>${s.permanent_address || ''}</td>
        <td>
          <button class="editBtn">Edit</button>
          <button class="deleteBtn">Delete</button>
        </td>
      </tr>`
    ).join('');

    studentsTable.innerHTML = `
      <tr>
        <th>Student #</th><th>Name</th><th>Birthday</th><th>Age</th><th>Course</th><th>Current Address</th><th>Permanent Address</th><th>Actions</th>
      </tr>${rows}
    `;

    document.querySelectorAll('.deleteBtn').forEach(b => b.addEventListener('click', async (e)=>{
      const id = e.target.closest('tr').dataset.id;
      if(!confirm('Delete this student?')) return;
      await fetch(apiBase + '/delete.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id}) });
      fetchStudents();
    }));

    document.querySelectorAll('.editBtn').forEach(b => b.addEventListener('click', (e)=>{
      const tr = e.target.closest('tr');
      const id = tr.dataset.id;
      document.getElementById('student_number').value = tr.children[0].textContent;
      document.getElementById('full_name').value = tr.children[1].textContent;
      document.getElementById('birthday').value = tr.children[2].textContent;
      document.getElementById('age').value = tr.children[3].textContent;
      const courseText = tr.children[4].textContent.trim();
      for(const opt of courseSelect.options){ if(courseText.includes(opt.text.split(' - ')[0])){ opt.selected = true; break; } }
      document.getElementById('current_address').value = tr.children[5].textContent;
      document.getElementById('permanent_address').value = tr.children[6].textContent;
      const submitBtn = form.querySelector('button[type=submit]');
      submitBtn.textContent = 'Update Student';
      form.dataset.editId = id;
    }));
  }catch(err){
    studentsTable.innerHTML = '<tr><td>Error fetching students</td></tr>';
  }
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = {
    student_number: document.getElementById('student_number').value.trim(),
    full_name: document.getElementById('full_name').value.trim(),
    birthday: document.getElementById('birthday').value,
    age: document.getElementById('age').value,
    course_id: document.getElementById('course_id').value,
    current_address: document.getElementById('current_address').value.trim(),
    permanent_address: document.getElementById('permanent_address').value.trim()
  };
  if(!payload.student_number || !payload.full_name){ alert('Student # and name required'); return; }
  const editId = form.dataset.editId;
  if(editId){
    payload.id = editId;
    await fetch(apiBase + '/update.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    delete form.dataset.editId;
    form.querySelector('button[type=submit]').textContent = 'Add Student';
  } else {
    await fetch(apiBase + '/create.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  }
  form.reset();
  ageInput.value = '';
  fetchStudents();
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  form.reset();
  delete form.dataset.editId;
  form.querySelector('button[type=submit]').textContent = 'Add Student';
  ageInput.value = '';
});

loadCourses();
fetchStudents();