const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {

    // How to use this scraper!

    // Step 1: Make sure to have Node.js installed on your computer
    // Step 2: Install the following packages by running the following commands in your terminal: npm install puppeteer fs
    // Step 3: Copy and paste this entire script into a new file called main.js
    // Step 4: Update the baseUrl, csvUrl, email, and password variables with your own information
    // Step 5: Run the script by running the following command in your terminal: node main.js
    // Step 6: Sit back and relax as the scraper does the hard work for you!

    const baseUrl = 'https://app.apollo.io/#/people?page=1&sortAscending=false&sortByField=%5Bnone%5D&organizationIndustryTagIds[]=5567e0e0736964198de70700&organizationIndustryTagIds[]=5567cdde73696439812c0000&organizationIndustryTagIds[]=5567ce9d7369643bc19c0000&organizationIndustryTagIds[]=5567cd527369643981050000&organizationIndustryTagIds[]=5567e29b736964256c370100&organizationIndustryTagIds[]=5567cdb77369645401080000&organizationIndustryTagIds[]=5567ce9c7369643bc9980000&organizationIndustryTagIds[]=5567cdda7369644eed130000&organizationIndustryTagIds[]=5567e1887369641d68d40100&organizationIndustryTagIds[]=5567ce1e7369643b806a0000&organizationIndustryTagIds[]=5567e1b3736964208b280000&organizationIndustryTagIds[]=5567f96c7369642a22080000&organizationIndustryTagIds[]=5567ce9673696453d99f0000&organizationIndustryTagIds[]=5567e28a7369642ae2500000&organizationIndustryTagIds[]=5567e0f27369640e5aed0c00&organizationIndustryTagIds[]=5567e2a97369642a553d0000&personLocations[]=Kuwait&personTitles[]=facility%20manager&personTitles[]=MEP&personTitles[]=procurement%20manager&personTitles[]=procurement&personTitles[]=Purchase&personTitles[]=chief%20engineer&personTitles[]=general%20manager&personTitles[]=VPs&personTitles[]=health%20inspector&personTitles[]=Cluster%20general%20manager&personTitles[]=Founder%20%26%20CEO&personTitles[]=founder&personTitles[]=CEO&personTitles[]=consultant&personTitles[]=director';
    const csvUrl = 'D:\Development\Agency_Resources\Datasets\apolloScrape\apollo-web-scraper\main.jsoutput.csv';
    const email = 'suhail@pixelandpunch.com';
    const password = '9447717600@As';

    // Start the Puppeteer browser

    console.time("ScriptRunTime");
    const browser = await puppeteer.launch({
        headless: false, // Set to true to run headless
        defaultViewport: null
    });

    const page = await browser.newPage();
    await page.goto('https://app.apollo.io/#/login');
    await page.waitForSelector('input[name="email"]', { visible: true });
    await page.waitForSelector('input[name="password"]', { visible: true });
    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.goto(baseUrl);
    await new Promise(resolve => setTimeout(resolve, 5000));
    const totalText = await page.evaluate(() => {
        const targetElement = Array.from(document.querySelectorAll('a')).find(e => e.textContent.trim().startsWith('Total'));
        return targetElement ? targetElement.textContent.trim() : null;
    });
    
    let totalItems = 0;
    if (totalText) {
        const totalItemsMatch = totalText.match(/\d+/);
        if (totalItemsMatch) {
            totalItems = parseInt(totalItemsMatch[0], 10);
            console.log(`Total items: ${totalItems}`);
        }
    }
    if (totalItems > 0) {
        const itemsPerPage = 25;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        console.log(`Total pages: ${totalPages}`);
        let allData = [];
        for (let i = 1; i <= totalPages; i++) {
            const pageUrl = `${baseUrl}&page=${i}`;
            console.log(`Scraping page: ${pageUrl}`);
            await page.goto(pageUrl);
            await page.waitForSelector('tbody', { visible: true });

            const data = await page.$$eval('tbody', tbodies => tbodies.map(tbody => {
                const tr = tbody.querySelector('tr');
                const tdName = tr ? tr.querySelector('td') : null;
                let name = tdName ? tdName.innerText.trim() : null;
                name = name.replace("------", "").trim();

                let parts = name.split(' ');
                let firstName = parts.shift();
                let lastName = parts.join(' '); 
        
                const quote = (str) => `"${str.replace(/"/g, '""')}"`;

                firstName = quote(firstName);
                lastName = quote(lastName);
                fullName = quote(name); 
        
                const tdJobTitle = tr ? tr.querySelector('td:nth-child(2)') : null;
                let jobTitle = tdJobTitle ? tdJobTitle.innerText.trim() : '';
                jobTitle = quote(jobTitle);
        
                const tdCompanyName = tr ? tr.querySelector('td:nth-child(3)') : null;
                let companyName = tdCompanyName ? tdCompanyName.innerText.trim() : '';
                companyName = quote(companyName);
        
                const tdLocation = tr ? tr.querySelector('td:nth-child(5) .zp_Y6y8d') : null;
                let location = tdLocation ? tdLocation.innerText.trim() : '';
                location = quote(location);
        
                const tdEmployeeCount = tr ? tr.querySelector('td:nth-child(6)') : null;
                let employeeCount = tdEmployeeCount ? tdEmployeeCount.innerText.trim() : '';
                employeeCount = quote(employeeCount);
        
                const tdPhone = tr ? tr.querySelector('td:nth-child(7)') : null;
                let phone = tdPhone ? tdPhone.innerText.trim() : '';
                phone = phone.replace(/\D/g, ''); 
                phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'); 
                phone = quote(phone);
        
                const tdIndustry = tr ? tr.querySelector('td:nth-child(8)') : null;
                let industry = tdIndustry ? tdIndustry.innerText.trim() : '';
                industry = quote(industry);
        
                const tdKeywords = tr ? tr.querySelector('td:nth-child(9)') : null;
                let keywords = tdKeywords ? tdKeywords.innerText.trim() : '';
                keywords = quote(keywords);
        
                let facebookUrl = '', twitterUrl = '', companyLinkedinUrl = '', companyUrl = '';
        
                if (tdCompanyName) {
                    const links = tdCompanyName.querySelectorAll('a[href]');
                    links.forEach(link => {
                        const href = link.href.trim();
                        if (href.includes('facebook.com')) facebookUrl = quote(href);
                        if (href.includes('twitter.com')) twitterUrl = quote(href);
                        else if (href.includes('linkedin.com/company')) companyLinkedinUrl = quote(href);
                        else if (link.querySelector('.apollo-icon-link')) companyUrl = quote(href);
                    });
                }
        
                const firstHref = tbody.querySelector('a[href]') ? tbody.querySelector('a[href]').href : '';
                const linkedinUrl = tdName && tdName.querySelector('a[href*="linkedin.com/in"]') ? tdName.querySelector('a[href*="linkedin.com/in"]').href : '';
                
                return { 
                    firstName: firstName, 
                    lastName: lastName, 
                    fullName: fullName,
                    jobTitle: jobTitle, 
                    companyName: companyName, 
                    location: location,
                    employeeCount: employeeCount, 
                    phone: phone,
                    industry: industry, 
                    firstHref: quote(firstHref), 
                    linkedinUrl: quote(linkedinUrl),
                    facebookUrl: facebookUrl, 
                    twitterUrl: twitterUrl, 
                    companyLinkedinUrl: companyLinkedinUrl, 
                    companyUrl: companyUrl,
                    keywords: keywords,
                }; 
            }));
            allData = allData.concat(data);
        }  
        async function processPerson(person, newPage) {
            console.log(`Processing person: ${person.name}`);
            const cleanedUrl = person.firstHref.replace(/"/g, '');
            console.log(`Navigating to cleaned URL: ${cleanedUrl}`);
        
            try {
                await newPage.goto(cleanedUrl, { waitUntil: 'networkidle0' });
                console.log(`Page navigated to ${cleanedUrl}`);
        
                await newPage.waitForSelector('#general_information_card', { timeout: 10000 });
                console.log(`Found #general_information_card`);

                const emailElements = await newPage.$$eval('#general_information_card', elements => elements.map(element => element.innerText));
                const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
                let emails = emailElements.flatMap(element => element.match(emailRegex) || []);
        
                person.emails = emails.length > 0 ? emails : ['']; 
            } catch (error) {
                console.error(`Error processing ${person.name} at ${cleanedUrl}: ${error}`);
                person.emails = [''];
            }
        }
        
        const batchSize = 5; 
        for (let i = 0; i < allData.length; i += batchSize) {
            const batch = allData.slice(i, i + batchSize);
            console.log(`Processing batch from index ${i} to ${i + batchSize - 1}`);
          
            await Promise.all(batch.map(async person => { 
                const newPage = await browser.newPage(); 
                try {
                    return await processPerson(person, newPage); 
                } catch (error) {
                    console.error(`Error processing ${person.name}: ${error}`);
                } finally {
                    await newPage.close(); 
                }
            }));
            console.log(`Completed batch from index ${i} to ${i + batchSize - 1}`);
        }

        const maxEmails = allData.reduce((max, p) => Math.max(max, p.emails.length), 0);
        const emailHeaders = Array.from({ length: maxEmails }, (_, i) => `Email ${i + 1}`).join(',');
        const csvHeader = `First Name,Last Name,Full Name,Job Title,Company Name,Location,Employee Count,Phone,Industry,URL,LinkedIn URL,Facebook URL,Twitter URL,Company LinkedIn URL,Company URL,Keywords,${emailHeaders}\n`;

        const csvRows = allData.map(person => {
            const paddedEmails = [...person.emails, ...Array(maxEmails - person.emails.length).fill('')];
            return `${person.firstName},${person.lastName},${person.fullName},${person.jobTitle},${person.companyName},${person.location},${person.employeeCount},${person.phone},${person.industry},${person.firstHref},${person.linkedinUrl},${person.facebookUrl},${person.twitterUrl},${person.companyLinkedinUrl},${person.companyUrl},${person.keywords},${paddedEmails.join(',')}`;
        }).join('\n');

        fs.writeFileSync(csvUrl, csvHeader + csvRows);
    } else {
        console.log('Element not found');
    }
    await browser.close();
    console.timeEnd("ScriptRunTime");
}
run().catch(console.error);
