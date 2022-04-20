const fs = require('fs');

const utils = require('../../utils');
const userData = require('../../page-objects/forms/data/user.po.data');
const loginPage = require('../../page-objects/login/login.wdio.page');
const commonPage = require('../../page-objects/common/common.wdio.page');
const reportsPage = require('../../page-objects/reports/reports.wdio.page');
const genericForm = require('../../page-objects/forms/generic-form.wdio.page');
const pregnancyDangerSignForm = require('../../page-objects/forms/pregnancy-danger-sign-form.wdio.page');

const xml = fs.readFileSync(`${__dirname}/../../forms/pregnancy-danger-sign-follow-up.xml`, 'utf8');
const formDocument = {
  _id: 'form:pregnancy-danger-sign-follow-up',
  internalId: 'pregnancy-danger-sign-follow-up',
  title: 'Pregnancy danger sign follow-up',
  type: 'form',
  _attachments: {
    xml: {
      content_type: 'application/octet-stream',
      data: Buffer.from(xml).toString('base64')
    }
  }
};

describe('Pregnancy danger sign follow-up form', () => {
  before(async () => {
    await utils.saveDoc(formDocument);
    await utils.seedTestData(userData.userContactDoc, userData.docs);
    await loginPage.cookieLogin();
    await commonPage.hideSnackbar();
  });

  it('Submit and validate Pregnancy danger sign follow-up form and keeps the report minified', async () => {
    await commonPage.goToReports();

    await reportsPage.openForm('Pregnancy danger sign follow-up');
    await pregnancyDangerSignForm.selectPatient('jack');
    await genericForm.nextPage();
    await pregnancyDangerSignForm.selectVisitedHealthFacility(true);
    await pregnancyDangerSignForm.selectDangerSigns(false);
    await reportsPage.submitForm();

    const reportId = await reportsPage.getCurrentReportId();
    const initialReport = await utils.getDoc(reportId);
    expect(initialReport.verified).to.be.undefined;

    await genericForm.openReportReviewMenu();
    await genericForm.invalidateReport();

    const invalidatedReport = await utils.getDoc(reportId);
    expect(invalidatedReport.verified).to.be.false;
    expect(invalidatedReport.patient).to.be.undefined;

    await genericForm.validateReport();
    const validatedReport = await utils.getDoc(reportId);
    expect(validatedReport.verified).to.be.true;
    expect(validatedReport.patient).to.be.undefined;
  });

  it('should submit and edit Pregnancy danger sign follow-up form (no changes)', async () => {
    await commonPage.goToReports();

    await reportsPage.openForm('Pregnancy danger sign follow-up');
    await pregnancyDangerSignForm.selectPatient('jill');
    await genericForm.nextPage();
    await pregnancyDangerSignForm.selectVisitedHealthFacility(true);
    await pregnancyDangerSignForm.selectDangerSigns(false);
    await reportsPage.submitForm();

    const reportId = await reportsPage.getCurrentReportId();
    const initialReport = await utils.getDoc(reportId);

    expect(initialReport._attachments).to.equal(undefined);

    await reportsPage.editReport(reportId);
    await genericForm.nextPage();
    await reportsPage.submitForm();

    const updatedReport = await utils.getDoc(reportId);
    expect(updatedReport.fields).excludingEvery('instanceID').to.deep.equal(initialReport.fields);

  });

  it('should submit and edit Pregnancy danger sign follow-up form with changes', async () => {
    await commonPage.goToReports();

    await reportsPage.openForm('Pregnancy danger sign follow-up');
    await pregnancyDangerSignForm.selectPatient('jill');
    await genericForm.nextPage();
    await pregnancyDangerSignForm.selectVisitedHealthFacility(true);
    await pregnancyDangerSignForm.selectDangerSigns(false);
    await reportsPage.submitForm();

    const reportId = await reportsPage.getCurrentReportId();
    const initialReport = await utils.getDoc(reportId);

    expect(initialReport._attachments).to.equal(undefined);

    await reportsPage.editReport(reportId);
    await pregnancyDangerSignForm.selectPatient('jack');
    await genericForm.nextPage();
    await pregnancyDangerSignForm.selectVisitedHealthFacility(false);
    await pregnancyDangerSignForm.selectDangerSigns(true);
    await reportsPage.submitForm();

    const updatedReport = await utils.getDoc(reportId);

    await reportsPage.openForm('Pregnancy danger sign follow-up');
    await pregnancyDangerSignForm.selectPatient('jack');
    await genericForm.nextPage();
    await pregnancyDangerSignForm.selectVisitedHealthFacility(false);
    await pregnancyDangerSignForm.selectDangerSigns(true);
    await reportsPage.submitForm();

    const compareReportId = await reportsPage.getCurrentReportId();
    const compareReport = await utils.getDoc(compareReportId);

    expect(updatedReport.fields).excludingEvery('instanceID').to.deep.equal(compareReport.fields);
  });
});
