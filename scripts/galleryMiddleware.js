
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export default function galleryMiddleware() {
    return {
        name: 'gallery-middleware',
        configureServer(server) {

            // ENDPOINT: Save Metadata (Gallery)
            server.middlewares.use('/api/save-gallery-meta', async (req, res, next) => {
                if (req.originalUrl === '/api/save-gallery-meta' && req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        try {
                            const { filename, title, tags, caption } = JSON.parse(body);

                            const imagesDir = path.join(process.cwd(), 'public/images');
                            const txtFilename = filename.endsWith('.txt') ? filename : `${filename}.txt`;
                            const filePath = path.join(imagesDir, txtFilename);

                            const fileContent = `Title: ${title}\nTags: ${tags}\nLegend: ${caption}`;

                            fs.writeFileSync(filePath, fileContent);

                            exec('node scripts/syncGallery.js', (err, stdout, stderr) => {
                                if (err) console.error('Error running sync script:', stderr);
                                else console.log('Sync script output:', stdout);
                            });

                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success: true, message: 'File saved and gallery synced' }));

                        } catch (error) {
                            console.error('Error saving gallery meta:', error);
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: error.message }));
                        }
                    });
                } else {
                    next();
                }
            });

            // ENDPOINT: Save Course
            server.middlewares.use('/api/save-course', async (req, res, next) => {
                if (req.originalUrl === '/api/save-course' && req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => body += chunk.toString());
                    req.on('end', () => {
                        try {
                            const data = JSON.parse(body);
                            const coursesDir = path.join(process.cwd(), 'public/cursos');

                            // Determine folder name
                            let folderName = data.id;
                            const slugify = (text) => text.toString().toLowerCase()
                                .replace(/\s+/g, '-')
                                .replace(/[^\w\-]+/g, '')
                                .replace(/\-\-+/g, '-')
                                .replace(/^-+/, '')
                                .replace(/-+$/, '');

                            if (!folderName || data.isNew || folderName.length > 15) {
                                folderName = slugify(data.title || 'curso-sem-titulo');
                            }

                            const coursePath = path.join(coursesDir, folderName);

                            if (!fs.existsSync(coursePath)) {
                                fs.mkdirSync(coursePath, { recursive: true });
                            }

                            // Format Meditators 
                            let mediatorsStr = '';
                            if (data.mediators && Array.isArray(data.mediators)) {
                                data.mediators.forEach((m, index) => {
                                    mediatorsStr += `Mediador${index + 1}: ${m.name} | ${m.bio}\n`;
                                });
                            }

                            const fileContent = `Title: ${data.title || ''}
Subtitle: ${data.subtitle || ''}
Category: ${data.category || 'Curso'}
Status: ${data.status || 'Aberto'}
Date: ${data.date || ''}
Link: ${data.link || ''}

Description:
${data.description || ''}

Intro:
${data.details?.intro || ''}

${mediatorsStr}

Format:
${data.details?.format ? data.details.format.join('\n') : ''}

Schedule:
${data.details?.schedule ? data.details.schedule.join('\n') : ''}

Tags: ${data.tags ? data.tags.join(', ') : ''}`;

                            fs.writeFileSync(path.join(coursePath, 'info.txt'), fileContent);

                            exec('node scripts/syncCourses.js', (err, stdout, stderr) => {
                                if (err) console.error('Error running syncCourses:', stderr);
                            });

                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success: true, folder: folderName, message: 'Course saved and synced' }));

                        } catch (error) {
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: error.message }));
                        }
                    });
                } else {
                    next();
                }
            });

            // ENDPOINT: Delete Course
            server.middlewares.use('/api/delete-course', async (req, res, next) => {
                if (req.originalUrl === '/api/delete-course' && req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => body += chunk.toString());
                    req.on('end', () => {
                        try {
                            const { id } = JSON.parse(body);
                            if (!id) throw new Error("ID not provided");

                            console.log(`Executing delete script for ID: ${id}`);
                            exec(`node scripts/deleteCourse.js "${id}"`, (err, stdout, stderr) => {
                                if (err) {
                                    console.error('Error running delete script:', stderr);
                                    // Potentially still return 200 if it was just "folder not found" in stderr?
                                    // But usually exec returns err if exit code != 0
                                }
                                console.log('Delete script output:', stdout);

                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ success: true, message: 'Delete script executed.', output: stdout }));
                            });

                        } catch (error) {
                            console.error('Error handling delete request:', error);
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: error.message }));
                        }
                    });
                } else {
                    next();
                }
            });


            // ENDPOINT: Force Sync Gallery
            server.middlewares.use('/api/sync-gallery', async (req, res, next) => {
                if (req.originalUrl === '/api/sync-gallery') {
                    exec('node scripts/syncGallery.js', (err, stdout, stderr) => {
                        res.setHeader('Content-Type', 'application/json');
                        if (err) {
                            res.statusCode = 500;
                            res.end(JSON.stringify({ success: false, error: stderr }));
                        } else {
                            res.end(JSON.stringify({ success: true, message: 'Gallery via sync script updated.', output: stdout }));
                        }
                    });
                } else {
                    next();
                }
            });

            // ENDPOINT: Force Sync Courses
            server.middlewares.use('/api/sync-courses', async (req, res, next) => {
                if (req.originalUrl === '/api/sync-courses') {
                    exec('node scripts/syncCourses.js', (err, stdout, stderr) => {
                        res.setHeader('Content-Type', 'application/json');
                        if (err) {
                            res.statusCode = 500;
                            res.end(JSON.stringify({ success: false, error: stderr }));
                        } else {
                            res.end(JSON.stringify({ success: true, message: 'Courses synced.', output: stdout }));
                        }
                    });
                } else {
                    next();
                }
            });

        }
    };
}
