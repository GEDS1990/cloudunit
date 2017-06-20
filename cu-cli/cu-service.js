#!/usr/bin/env node
'use strict';
const program = require('commander');
const chalk = require('chalk');
const columnify = require('columnify');

const client = require('./lib/client');
const out = require('./lib/out');

program
  .command('add <app> <service>')
  .description('add a service')
  .action(function(app, service) {
    client.applications
      .follow('cu:applications[name:'+app+']','cu:services')
      .post({ 'imageName': service }, function (error, response) {
        if (error) {
          out.error('Couldn\'t add a service: '+error);
          return;
        }
        if (response.statusCode != 201) {
          out.error('Couldn\'t add a service: '+response.body);
          return;
        }
        out.info('Service '+service+' added to '+app);
      });
  });

  program
    .command('list <app>')
    .alias('ls')
    .description('list all services')
    .action(function(app) {
      client.applications
        .follow('cu:applications[name:'+app+']','cu:services')
        .getResource(function (error, doc) {
          if (error) {
            out.error('Couldn\'t list services: '+error);
            process.exit(1);
          }
          if (!doc._embedded) {
            doc._embedded = { 'cu:services': [] };
          }
          out.info(columnify(
            doc._embedded['cu:services'],
            { columns: ['name', 'imageName', 'state'] }));
        });
    });

  program
    .command('rm <app> <service>')
    .description('remove a service')
    .action(function(app, service) {
      client.applications
        .follow('cu:applications[name:'+app+']','cu:services','cu:services[name:'+service+']','self')
        .delete(function (error, response) {
          if (error) {
            out.error('Couldn\'t remove a service: '+error);
            process.exit(1);
          }
          if (response.statusCode != 204) {
            out.error('Couldn\'t remove a service: '+response.body);
            process.exit(1);
          }
          out.info('Service '+service+' removed from '+app);
        });
    });

program.parse(process.argv);